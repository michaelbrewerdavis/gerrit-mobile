Provides a mobile view of [Gerrit Code Review][https://www.gerritcodereview.com].

To start:
- Initialize your `.env` file with the desired Gerrit endpoint.
- `npm install`
- `npm run start`

You can also use the accompanying Docker and Docker Compose files.

To use:
- Ensure you have an http password set in Gerrit (see user preferences).
- Hit your URL (at first localhost:3000, but I assume you can do better
  than that)
- Be happy

Next steps:
- Comments - view and add
- line numbers
- Eliminate need for http password set in Gerrit
- add react router for url state
- Voting - view and add
