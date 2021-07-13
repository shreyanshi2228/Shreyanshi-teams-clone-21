 HOW TO RUN MY APPLICATION LOCALLY:

Delete all package-lock.json and yarn files and node-modules. 
Reinstall by doing (npm i) in both client and server side.
Create env because they contain personal information(Redis and Twilio credentials). 
You’re good to go :)

 Why Redis?
 
So Redis is an in memory data store kind of database,but very very fast. In my
app, I am using it to store the peer code. So, let's say one user initiates a call  
and waits for the other user, In-between; I don't want to lose that connection 
code, so I am storing it on redis (one can use any database for that) So when 
the other user hits the same url - I will get the relevant code for the person and 
make the connection.

Why Twilio?

Earlier, without twilio, the app got deployed but two people from different network  
connections weren’t able to interact because of no TURN server. As a result, I 
used a third party solution(Twilio) so it gave me some free TURN server   
bandwidth.

Functional Features

1. Real-time clock
2. Screen Sharing
3. Chat feature
4. Toggle Audio and Video
4. Reach to your home screen if you enters in the wrong meet.
5. Two people can interact :)


Technologies that I used to develop this teams’s clone:

1.NodeJS
2.Socket.IO
3.Simple-Peer
4.ReactJS



# Clone your fork
$ git clone your-fork-url && cd client/

# Create a branch with your feature
$ git checkout -b my-feature

# Make the commit with your changes
$ git commit -m 'feat: My new feature'

# Send the code to your remote branch
$ git push origin my-feature/ git push heroku master(if deploying on heroku)


How to contribute

Make a fork of this repository

# Fork using GitHub official command line
# If you don't have the GitHub CLI, use the web site to do that.

