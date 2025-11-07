# CotOAgent

## Actions

- Actions performed autonomously:
  - Look at race, class and spells pages
  - Randomly roll stats
  - Assign stats semi optimally
  - Store character in database
  - Get character ID
  - Create character sheet view
  - Display on UI
  - Must include all 6 stats (STR, DEX, CON, INT, WIS, CHA)
  - Semi-optimal assignment based on class
  
- Actions performed after user confirmation:
  - Create a character with stats
    - Store character in database
    - Get character ID
    - Create character sheet view
    - Display on UI
  - Send character sheet/stats to Discord
    - Format character data for Discord embed
    - Send to configured Discord channel
    - Parse Discord responses
    - Update character based on feedback
    - Use Discord webhooks or bot integration
    - Include character image/visualization in embed
    - Handle async Discord API calls
  - Revise character (MUST)
    - Display current character sheet
    - Show revision proposals
    - Allow user to accept/reject revisions
    - Track revision history
    - MUST allow user to review before applying changes
    - Store audit log of all revisions
    - Maintain version history

- Actions that automatically adjust the ui:
  - Display filled out character sheet
  - Show available races, classes, and spells
  - Update UI based on selections
  - Render character attributes dynamically
  - Update stats display in real-time
  - Manage UI state
  - Character sheet must be visually clear
  - All races, classes and spells must be embedded/available
  - Responsive design required
  
- Embed all races, classes and spells

## Views

- First time (how to use the app) page
- Look at character
- Look at revisions proposals
- Look at rollers
- View all characters
- Look at discord responses
- Audit Log -> send to db and then display
- Browse Race
- Browse Class
- Browse Spells
	

- Admin page for load and embed database


