const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchMessages(roomId) {
    const res = await fetch(`${BASE_URL}/messages?roomId=${roomId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load messages');
    const data = await res.json();
    
    // Transform data to match frontend expectations if necessary
    return data.map(msg => ({
        id: msg._id,
        sender: msg.sender?.name || 'Unknown',
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: msg.sender?._id === JSON.parse(localStorage.getItem('rr_user'))?._id,
        type: msg.type,
        content: msg.content
    }));
}

export async function sendMessage(roomId, data, type = 'text') {
    const msgText = type !== 'text' ? data.text : data;
    const content = type !== 'text' ? data : null;

    const res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ roomId, text: msgText, type, content }),
    });
    
    if (!res.ok) throw new Error('Failed to send message');
    const msg = await res.json();

    return {
        id: msg._id,
        sender: 'You',
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        type: msg.type,
        content: msg.content
    };
}

export async function fetchChatBrothers() {
    const res = await fetch(`${BASE_URL}/members`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load brothers');
    return await res.json();
}
