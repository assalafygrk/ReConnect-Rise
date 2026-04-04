export async function fetchMessages(roomId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (roomId === 'public') {
                resolve([
                    { id: 1, sender: 'Ola Fashola', text: 'As-salamu alaykum brothers! Hope we are all ready for the next meeting.', time: '09:00', isMe: false },
                    { id: 2, sender: 'You', text: 'Wa alaykum as-salam! Yes, I have the agenda ready.', time: '09:15', isMe: true },
                    { id: 3, sender: 'Seun Adeyemi', text: 'I might be 5 minutes late, but I will join the Zoom link.', time: '09:20', isMe: false },
                ]);
            } else {
                resolve([
                    { id: 101, sender: 'Brother Seun', text: 'Hello, regarding the loan request...', time: 'Yesterday', isMe: false },
                    { id: 102, sender: 'You', text: 'I am reviewing it now.', time: 'Yesterday', isMe: true },
                ]);
            }
        }, 500);
    });
}

export async function sendMessage(roomId, data, type = 'text') {
    return new Promise((resolve) => {
        const isAttachment = type !== 'text';
        const msgText = isAttachment ? data.text : data;
        const content = isAttachment ? data : null;

        setTimeout(() => {
            resolve({
                id: Date.now(),
                sender: 'You',
                text: msgText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
                type: type,
                content: content
            });
        }, 300);
    });
}
