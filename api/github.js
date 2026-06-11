// api/github.js — Vercel Serverless Function for GitHub data
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "CrowdContract";
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "arpit-portfolio",
    ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
  };

  const type = req.query.type || "profile";

  try {
    const fetch = (await import("node-fetch")).default;

    if (type === "profile") {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`, { headers }),
      ]);

      const user = await userRes.json();
      const repos = await reposRes.json();

      // Pinned repos simulation — using starred/most-updated public repos
      const pinnedNames = [
        "CivicReport",
        "NextGen-EduTrack",
        "VideoMindAI",
        "Unstop_smartdocai",
        "planto",
        "SmartDocAI",
        "fullstack-ecommerce-mern",
      ];

      const pinned = Array.isArray(repos)
        ? repos
            .filter((r) => pinnedNames.some((n) => r.name.toLowerCase().includes(n.toLowerCase())))
            .slice(0, 6)
        : [];

      const totalStars = Array.isArray(repos)
        ? repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)
        : 0;

      return res.status(200).json({
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
          public_repos: user.public_repos,
          followers: user.followers,
          following: user.following,
          bio: user.bio,
          html_url: user.html_url,
        },
        pinned,
        totalStars,
      });
    }

    if (type === "commits") {
      // Get recent commits across top repos
      const reposRes = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=5`,
        { headers }
      );
      const repos = await reposRes.json();

      if (!Array.isArray(repos)) {
        return res.status(200).json({ commits: [] });
      }

      const commitPromises = repos.slice(0, 4).map(async (repo) => {
        try {
          const cRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits?per_page=3`,
            { headers }
          );
          const commits = await cRes.json();
          if (!Array.isArray(commits)) return [];
          return commits.map((c) => ({
            repo: repo.name,
            repoUrl: repo.html_url,
            sha: c.sha?.slice(0, 7),
            message: c.commit?.message?.split("\n")[0] || "",
            date: c.commit?.author?.date,
            url: c.html_url,
          }));
        } catch {
          return [];
        }
      });

      const allCommits = (await Promise.all(commitPromises))
        .flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      return res.status(200).json({ commits: allCommits });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    console.error("GitHub API error:", err);
    return res.status(500).json({ error: "Failed to fetch GitHub data" });
  }
};
