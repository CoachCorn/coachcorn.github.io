# Mental Reps

A phone quiz for your own playbook. You type plays into a Google Sheet; players quiz themselves on their phones; their progress lands back in your Sheet.

## Set up (about 10 minutes)
1. Make a new Google Sheet. Open **Extensions > Apps Script**.
2. Delete what is there, paste in everything from `Code.gs` (in this folder), and save.
3. Pick **setupSheet** in the function dropdown and click **Run**. Approve the permissions. Your Sheet now has Settings, Cards, Roster and Log tabs filled with sample data.
4. **Settings** tab: change the team name, positions, and the **Coach code**. Put this page's link in **Page URL**: `https://coachcorn.github.io/mental-reps/`
5. **Deploy > New deployment > Web app**. Execute as: Me. Who has access: Anyone. Deploy and approve.
6. Reload the Sheet. Use the new **Mental Reps** menu > **Show my player link**. Send that link to your players.

## Your playbook: one tab per deck
Every tab other than Settings, Roster, Log and Drills is a deck. The tab name is the deck name players see, and tab order is deck order.
- **Add a deck:** Mental Reps menu > **New deck tab**, or copy any deck tab and rename it. Only a **Question** column is required, so a tab you build by hand works too.
- **Retire a deck:** hide the tab (right-click > Hide sheet), or start its name with `_`. Players' progress stays in the Log.
- **Columns:** Positions is `ALL` or a comma list like `WR, TE` (blank means ALL). Leave Wrong 1-3 empty for a flip card. Explanation shows after answering. Image is a Google Drive share link ("Anyone with the link") or any https image link. Active `no` hides one card. Leave ID blank; the app fills it in.
- **Split the work:** give each coach their own tab, for example `WR Pass Install`, `OL1 Run Install`. Share the Sheet with them as an editor.
- **Lock the base offense:** right-click its tab > **Protect sheet** > Set permissions > Restrict who can edit > Only you. Coaches can still add rows to their own tabs. New IDs are still filled in on protected tabs.

## Coach dashboard
In the Sheet: **Mental Reps > Refresh dashboard** builds **Mastery** and **Most Missed**. On the phone: open the link, tap **Coach view**, enter your coach code.

A card is mastered after 3 correct in a row on at least 2 different days (change in Settings). A miss resets the streak.

## 2 Min Drill and leaderboard
Players get a timed drill (multiple choice cards only) with a leaderboard per deck, plus Mixed. Scores go to a **Drills** tab, created automatically. Drill answers never count toward mastery. After updating Code.gs, deploy a new version.
