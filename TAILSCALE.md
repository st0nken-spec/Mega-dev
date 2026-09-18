# Tailscale access plan

1. Install Tailscale on the Linux host with a stable role-based device name.
2. Enable MagicDNS and tailnet HTTPS certificates.
3. Use Tailscale Serve, or Caddy bound only to the Tailscale interface, for HTTPS.
4. Test from Ivan's phone away from home Wi-Fi.
5. Invite his wife as a tailnet user for ongoing household access. Sharing only the app host is an alternative for narrow access.
6. Allow family users to reach the app's HTTPS port, but not SSH, databases or admin panels.
7. Test removing a user and a lost phone before storing sensitive data.

Tailscale Serve stays private. Funnel exposes a service to the public internet and is outside the private-alpha model.

A native app calls the backend through its tailnet HTTPS name. The phone needs Tailscale connected unless a later decision approves a public endpoint. Web users open the same private URL.

Never commit the real tailnet name, user emails, device IPs, auth keys or certificates to this public repository.

## Invite or share?

- **Invite to tailnet:** best for ongoing family access and future shared services; requires deliberate access rules.
- **Share one machine:** useful when someone should reach only this host without joining the rest of the tailnet.
