# 60-SECOND DEMO STORYBOARD — **MOLT**

**Compiled:** 2026-11-18 · **Length:** 60 seconds · **Host:** YouTube (public, marked "Not for Kids")
· **Shows:** real, working functionality only.

> **Honesty rules.** Every frame depicts functionality planned for implementation and shown running on
> Reddit. **No fake statistics, no simulated player counts presented as real, no fabricated
> leaderboards, no misleading backend claims.** Where the demo town has few players, the on-screen
> caption says so ("demo town — N players"). The two-player interaction shown is performed by **two
> real accounts**.

---

## Storyboard

| Time | Beat | On screen | Purpose |
| --- | --- | --- | --- |
| **0–8 s** | **The hook** | Open on the Reddit post. The Molt fills the screen — a naturalist's field plate of a scarred beast. Caption: **"Last night the crowd burned the Crown 412 times. The Crown is armoured."** A soft, glowing **Gut** pulses. | Show the game *immediately*; establish that the beast remembers the crowd |
| **8–20 s** | **The unique mechanic** | The player taps **Gut**. The three tools light up with *effective / risky* labels. They pick **Pierce**. A small line shows **"2% of today's strikes chose this."** They strike: **53 damage**, a **"READ"** badge, and the shared Integrity bar drops. | Demonstrate the central mechanic: *right tool + unfashionable zone = the crowd factor* |
| **20–32 s** | **The distinctive feature (crowd-shapes-the-beast)** | Cut to a **"Molt" transition**: the beast's body re-forms before your eyes — the over-hit Crown plates over with **cross-hatching**; the ignored **Tail** opens as a **Raw** wound. Caption: **"00:00 UTC. The beast is rebuilt from what the crowd did."** | Show the one thing no other daily game does: the community's behaviour becomes the adversary |
| **32–42 s** | **The Reddit-native experience** | Cut to the **comment thread**: real comments arguing strategy ("head's armoured, everyone take the tail"). Show a **"Contrarian" flair** on a commenter and the **daily post's real upvote/comment counts** (captioned with the true numbers). Then tap **"Post your read"** and show the pre-filled spoiler-tagged score line land in the thread. | Show comments-as-war-room, flair, and one-tap sharing — genuinely native |
| **42–52 s** | **Daily progression & consequence** | Show the **result card**: today's damage, the **Read streak**, the **Trophy tally**, and the **community outcome** — **"SLAIN"** with a new **skin** unlocked, *or* **"ESCAPED — tomorrow it starts hardened."** Then a quick pan of the **Bestiary**: past beasts as plates with their kill stats. | Show why tomorrow matters and that the world persists |
| **52–60 s** | **The payoff** | Final frame: a wide shot of the beast with **every scar and ridge the community has ever left**, the game name **MOLT**, and **r/‹subreddit›**. One clean, quotable image: *"It is made of what you did yesterday."* | Deliver the memorable payoff and the call to play |

---

## Required working functionality (what the demo must actually do)

| # | Must genuinely work | How a judge verifies it |
| --- | --- | --- |
| W1 | The app runs on Reddit; the post opens the beast inline and in expanded mode | Judge opens the demo post and plays |
| W2 | A strike is accepted **once** per user per day and is **server-authoritative** | Judge strikes; a second strike is refused; reload shows the locked state |
| W3 | The **crowd factor** is real: the same `(zone,tool)` chosen by few players scores higher | Judge strikes a low-share combo and sees the READ badge / higher damage |
| W4 | The **beast is shared**: another account's strike moves the shared Integrity bar | Judge strikes in account B and sees the bar move for account A |
| W5 | The **molt is real**: advancing the day rebuilds the beast from the previous day's data (via the mod-menu advance, since the harness clock is frozen) | Judge triggers advance-day and sees the new states derived from the data |
| W6 | **Resolution** produces SLAIN/ESCAPED and a persisted **Bestiary** entry | Judge opens the Bestiary and sees real past results |
| W7 | **Streak, trophies, reads, flair** are real and persisted | Judge plays two days (or inspects stored state) |
| W8 | **Journeys** events fire (`App.Ready`, Start/Progress/End) | Visible in analytics; noted in the README |

**Explicitly not claimed in the demo:** any player count we do not have; any leaderboard position we
cannot show; any backend behaviour that is not running.

---

## Demo production notes

- Record on **mobile portrait** (primary) with a short **desktop** inset, because judges review on
  desktop web and the criterion includes mobile design.
- Use the **mod-menu advance-day** to demonstrate the molt honestly — the caption should say
  *"day advanced via the in-game test control"* so the mechanism is transparent.
- Keep the first line on screen for the whole first 8 seconds; the hook is the point.
- Total runtime ≤ 60 s (the rules say judges are not required to watch beyond one minute).
- The video shows the **real** demo subreddit; if it has few players, say so on screen.

---

## Why this demo can win

1. **It opens on the differentiator** — a beast that remembers the crowd — not on a logo or a menu.
2. **The mechanic is legible in ten seconds** (right tool, unfashionable zone) and *deep* thereafter.
3. **The crowd-shapes-the-beast moment** (20–32 s) is something no competitor can show, because no
   daily game has it.
4. **The Reddit-native beat is real** — comments, flair, and a one-tap share, not a bolted-on button.
5. **The payoff is a permanent record** — the beast's accumulated scars — which is exactly the
   "community you built together" feeling the judges reward.
