MtgCuBot

//help

+ //cube {cubecobra_id} - links to cubecobra overview with the given id
+ //pack {cubecobra_id} - links to random cubecobra samplepackimage with the given id
+ //draft {cubecobra_id} {num_players} - starts a draft of the given cube for the given number of players
- //join {draft_id} - player joins draft
- //kick {draft_id} {user_id} - kick player from draft
- //report {draft_id} {record} {img} - record a draft result for the given draft
- //record {username} - returns the full draft record of the given user
- //decks {username} - returns all deck images posted by the given user
- //decks {cubecobra_id} - returns all deck images for the given cube
- //trophyleader - returns the name of the current trophy leader

TODO
1. Autocomplete cubecobra id input with cubes drafted before (in drafts table)
2. Generate draft bracket and send pairings
3. Implement /report command

//cube grenrutvintage

- link cubecobra

//pack grenrutvintage

- show random sample pack image

//draft grenrutvintage 8

- set up draft
- send discord embed that shows:
	player count
	link to cube
	join button for people to join
	start button IF you did the //draft command
- sends seating chart once draft starts
	could have some logic in here to take into account people's records
- pairings are always cross-pod

//rc {draft_id} 2-1 {img}

- saves draft record object to db with values:
	name: {username}
	wins: {wins}
	losses: {losses}
	draws: {draws}
	img: {deck/pool img}
	cube: {cube_id}
	created_at: {date created}

//record Turner

- sends message with:
	Turner has drafted X times
	Turner has trophied X times
	total wins: 32
	total losses: 14
	total draws: 1
	drafter since: date of first draft recorded

//deckimages 0-3 {username}
//deckimages 3-0 {cube_id}

- sends images of decks with the specified recorded for that user or that cube
	if a number in the record is X, will return any record with wins/losses/draws X (X-X-1 is any record with one draw)

//trophyleader

- bear is the current trophy leader with X trophies out of X total drafts!!





Structure:

Player class
- static methods to search for players or to perform player-relevant actions
- create a Player class for use in a draft

Draft class
- Draft-specific methods
- create one with a unique id when starting a draft

Main class
- handle discord commands


Sequelize Tables
Drafts (id, cubecobra_id, status, date, created_at)
Records (id, username(user id?), wins, losses, draws, img_url, created_at)



