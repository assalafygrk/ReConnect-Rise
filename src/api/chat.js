const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Fetch Messages ───────────────────────────────────────────────────────────
export async function fetchMessages(roomId = 'public') {
    const res = await fetch(`${BASE_URL}/messages?roomId=${roomId}`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load messages');

    const messages = await res.json();

    // Transform backend shape → frontend shape expected by ChatPage
    // Backend: { _id, senderName, text, type, content, isMe, createdAt }
    // Frontend: { id, sender, text, time, isMe, type, content }
    return messages.map((m) => ({
        id: m._id,
        sender: m.senderName || 'Unknown',
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.isMe,
        type: m.type || 'text',
        content: m.content || null,
    }));
}

// ─── Send Message ─────────────────────────────────────────────────────────────
export async function sendMessage(roomId, data, type = 'text') {
    const isAttachment = type !== 'text';
    const msgText = isAttachment ? data.text : data;
    const content = isAttachment ? data : null;

    const res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ roomId: roomId || 'public', text: msgText, type, content }),
    });
    if (!res.ok) throw new Error('Failed to send message');

    const m = await res.json();
    return {
        id: m._id,
        sender: m.senderName || 'You',
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        type: m.type || 'text',
        content: m.content || null,
    };
}
