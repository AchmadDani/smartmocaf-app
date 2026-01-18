export function usernameToEmail(username: string): string {
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    return `${cleanUsername}@gmail.com`;
}
