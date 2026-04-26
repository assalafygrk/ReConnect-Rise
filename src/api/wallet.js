export async function fetchWallet() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                balance: 12500,
                recentTransactions: [
                    { id: 1, type: 'credit', amount: 5000, note: 'Wallet Top-up', date: '2026-03-25' },
                    { id: 2, type: 'debit', amount: 1000, note: 'Gift to Brother Ola', date: '2026-03-24' },
                    { id: 3, type: 'credit', amount: 500, note: 'Gift from Brother Seun', date: '2026-03-22' },
                ]
            });
        }, 600);
    });
}

export async function transferFunds(to, amount, note) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (amount <= 0) return reject(new Error('Invalid amount'));
            resolve({ success: true, id: Date.now() });
        }, 1000);
    });
}
