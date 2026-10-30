# Call Sheet

A phone quiz for your own playbook. You type plays into a Google Sheet; players quiz themselves on their phones; their progress lands back in your Sheet.

## Set up (about 10 minutes)
1. Make a new Google Sheet. Open **Extensions > Apps Script**.
2. Delete what is there, paste in everything from `Code.gs` (in this folder), and save.
3. Pick **setupSheet** in the function dropdown and click **Run**. Approve the permissions. Your Sheet now has Settings, Cards, Roster and Log tabs filled with sample data.
4. **Settings** tab: change the team name, positions, and the **Coach code**. Put this page's link in **Page URL**: `https://coachcorn.github.io/call-sheet/`
5. **Deploy > New deployment > Web app**. Execute as: Me. Who has access: Anyone. Deploy and approve.
6. Reload the Sheet. Use the new **Call Sheet** menu > **Show my player link**. Send that link to your players.

## Your playbook
One row per card on the **Cards** tab.
- **Deck**: the group it shows under. **Positions**: comma list like `QB, WR`, or `ALL`.
- **Question / Answer / Wrong 1-3**: leave the Wrong columns empty to make a flip card (show answer, then Knew it / Missed it).
- **Explanation**: shown after they answer. **Image**: a link to a play diagram (a Google Drive share link works). **Active**: put `no` to hide a card.
- Leave **ID** blank. It fills itself in. Clearing an ID resets everyone's progress on that card.

## Coach dashboard
In the Sheet: **Call Sheet > Refresh dashboard** builds **Mastery** and **Most Missed**. On the phone: open the link, tap **Coach view**, enter your coach code.

A card is mastered after 3 correct in a row on at least 2 different days (change in Settings). A miss resets the streak.
