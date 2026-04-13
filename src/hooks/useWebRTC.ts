import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function useWebRTCSender(userId: string) {
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRefs = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<any>(null);

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      streamRef.current = stream;
      setIsSharing(true);

      // Handle user manually stopping via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };

      // Set DB status
      await supabase.from('screen_sessions').upsert({ 
        user_id: userId, 
        status: 'active',
        started_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      // Join Signaling Channel
      const channel = supabase.channel(`webrtc:${userId}`);
      channelRef.current = channel;

      channel.on('broadcast', { event: 'view-request' }, async ({ payload }) => {
        const { adminId } = payload;
        
        // Clean up any old connection for this specific admin
        if (pcRefs.current.has(adminId)) {
          pcRefs.current.get(adminId)?.close();
        }
        
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRefs.current.set(adminId, pc);

        // Add local stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, streamRef.current!);
          });
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: 'broadcast',
              event: 'ice-candidate',
              payload: { candidate: event.candidate, target: adminId, senderId: userId }
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        channel.send({
          type: 'broadcast',
          event: 'webrtc-offer',
          payload: { offer, target: adminId, senderId: userId }
        });
      });

      channel.on('broadcast', { event: 'webrtc-answer' }, async ({ payload }) => {
        const pc = pcRefs.current.get(payload.adminId);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      });

      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        // Ensure we only process candidates aimed at us from a specific admin
        if (payload.target === userId) {
          const pc = pcRefs.current.get(payload.adminId);
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      });

      channel.subscribe();

    } catch (err) {
      console.error('Error starting screen share', err);
      setIsSharing(false);
    }
  };

  const stopSharing = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close all connections
    pcRefs.current.forEach(pc => pc.close());
    pcRefs.current.clear();
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setIsSharing(false);
    
    await supabase.from('screen_sessions').upsert({ 
      user_id: userId, 
      status: 'stopped'
    }, { onConflict: 'user_id' });
  };

  return { startSharing, stopSharing, isSharing };
}


export function useWebRTCReceiver(adminId: string) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const viewScreen = async (targetEmployeeId: string) => {
    setIsConnecting(true);
    setRemoteStream(null);

    // Clean up old
    if (pcRef.current) pcRef.current.close();
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase.channel(`webrtc:${targetEmployeeId}`);
    channelRef.current = channel;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate, target: targetEmployeeId, adminId }
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setIsConnecting(false);
    };

    channel.on('broadcast', { event: 'webrtc-offer' }, async ({ payload }) => {
      if (payload.target !== adminId) return; // Only process our offer if there are multiple admins

      await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      channel.send({
        type: 'broadcast',
        event: 'webrtc-answer',
        payload: { answer, target: targetEmployeeId, adminId }
      });
    });

    channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
      if (payload.target === adminId && payload.senderId === targetEmployeeId && pcRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Request the employee to start the WebRTC handshake
        await channel.send({
          type: 'broadcast',
          event: 'view-request',
          payload: { adminId }
        });
      }
    });
  };

  const stopViewing = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setRemoteStream(null);
    setIsConnecting(false);
  };

  return { viewScreen, stopViewing, remoteStream, isConnecting };
}
