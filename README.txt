CuBot is a Magic: The Gathering related bot you can add to your server to help record data about Cube drafts!

You can operate it using the following slash commands:

General
/help			- List available commands
/cube {cubecobra_id}	- Link to a cubecobra cube
/pack {cubecobra_id}	- Display a sample pack from a cubecobra cube

Drafting
/draft {cubecobra_id}	- Start recording an IRL cube draft
/report {draft_id}	- Report the results of an IRL cube draft

Analytics
/record {username}	- Return the full draft record of a user
/decks {username} 	- Return all deck images from a user
/decks {cubecobra_id} 	- Return all deck images for a cube
/trophyleader 		- returns the name of the current trophy leader

Current main TODO list
1. Implement /report command
2. Host bot on a server
3. Server Roles message
4. Welcome p1p1 message
5. Implement all the analytics commands

Ideas backlog
- Autocomplete cubecobra id input with cubes drafted before (in drafts table)
- async virtual drafting option, done either in DMs or as ephemeral messages in a dedicated channel
- When a player reports, if that draft makes them the new trophyleader, send a message stating so
- Add 'tag' option to /report command, letting someone describe their results with one or more string tags
- A year after a player reports their first result, send them an anniversary message with their first deck pic

Slash Command Example Uses

/cube grenrutvintage

	Sends a message with the following content:

		https://cubecobra.com/cube/overview/grenrutvintage

/pack grenrutvintage

	Sends a message with the following content and a random seed:

		https://cubecobra.com/cube/samplepackimage/grenrutvintage/{seed}

/draft grenrutvintage

	Sends the following message first:

		Created grenrutvintage draft: {draft_id}
		Join		Leave

	As well as a followup message to just the user that created the draft:

		Start the draft when everyone joins!
		Start		Close

	Whenever a user clicks the join button, their username will be added to the first message

	When the creator clicks the start button, the bot will take all the users that have joined,
	shuffle them up, and print out a seating chart along with pairings for round 1 and
	a bye if there is an odd number of players.

	Behind the scenes, a new row will be added to the Drafts table to record timestamps and
	which cube was drafted

/report (TODO)

	Allows the user that fired the command to report their draft results

	Submitted results will be added as a row to the Records table that include:
		draft_id
		user_id
		wins
		losses
		draws
		image_url
		colors
		timestamps

/record

	Sends message with the following content based on the user that called the command:
		{user} has drafted {total_draft} times
		{user} has trophied {trophies} times
		total wins: {total_wins}
		total losses: {total_losses}
		total draws: {total_draws}
		drafter since: {date of first draft recorded}

/decks 0-3 tempocube

	Sends message with attached deck images recorded from tempocube drafts that have an 0-3 record

/decks 3-0

	Without a cube_id, sends a message with attached deck images recorded by the user that have a 3-0 record
		
/trophyleader

	Sends a message with the following content based on which user has the most 3-0 records

		{user} is the current trophy leader with {total_trophies} trophies out of {total_drafts} total drafts!!



Sequelize Table Schema

Drafts
	id		int
	cube_id		int
	status		string (open, closed)
	date		date
	created_at	datetime
	updated_at	datetime

	-- private	bool (true for hidden draft that won't appear in reporting, use for testing or unreported drafts, false otherwise)

Records
	id		int
	user_id		int
	wins		int
	losses		int
	draws		int
	img_url		text (not sure the best way to handle this yet, images will be fairly large, taken from phone cameras)
	colors		string (capitalized string of sorted color symbols, ex: 'U', 'RG', 'WUBRG')
	created_at	datetime
	updated_at	datetime
