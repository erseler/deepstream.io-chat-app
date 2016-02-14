//js goes here
client = deepstream( 'localhost:6020' ).login();
var uid = client.getUid()
console.log('client connected');

var users = client.record.getRecord( 'users' );
var user = client.record.getRecord('user');

$(document).ready(function(){
    $('#chat-room').hide();
    $('#private-chat').hide();
    $('#login-button').on('click', function(){
        console.log("button pressed!")

        var name = $('#name').val();
        var lastname = $('#lastname').val();
        
        user.set({ 'firstname': name, 'lastname': lastname })
        users.set(uid, user.get())

        $('#login-page').hide();
        $('#user-profile').text(user.get()['firstname'] + " " + user.get()['lastname'])
        for(var key in users.get()){
            var li = $('<li>')
            if(key!=uid){
                li.attr('id', key) 
                li.text(users.get()[key]['firstname'] + " " + users.get()[key]['lastname'])
                //a.append(li)
                $('#users-list').append(li)    
            }
        }
        $('#chat-room').show();
        
        users.subscribe(function( data ){
            $('#users-list').empty();
            for(var key in data){
                var li = $('<li>')
                if(key!=uid){
                    li.attr('id', key) 
                    li.text(data[key]['firstname'] + " " + data[key]['lastname'])
                    //a.append(li)
                    $('#users-list').append(li)
                }
            }
        });
    })
    
    ///////////////////////////////////////////////////////////////////
    //////////                   CHAT
    ///////////////////////////////////////////////////////////////////
    client.event.subscribe('chat', function(data){
        var user = users.get()[data.uid]
        console.log(user.firstname + " " + user.lastname + ": " + data.msg)
    })    

    $('#send-msg').on('click', function(){
        var msg = $('#msg-content').val()
        client.event.emit( 'chat', {'msg':msg, 'uid':uid});
    })
    //////////////////////////////////////////////////////////////////
    /////////               PRIVATE CHAT
    //////////////////////////////////////////////////////////////////
    client.event.subscribe('chat-request',function(data){
        if(data.targetUid==uid){
            $('#chat-room').hide();
            $('#private-chat').show();
            client.event.subscribe('private-chat/' + data.uid, function(message){     
                console.log(message.sender + " says: " + message.content)
            })

            $('#private-chat-send').on('click',function(){
                var content = $('#private-chat-content').val()
                client.event.emit('private-chat/' + data.uid, {'sender':users.get()[uid]['firstname'], 'content':content})
            })
            
        }
    })

    $("#users-list").on('click', 'li', function(event) {
        var targetUid = event.target.id;           
        client.event.emit('chat-request', {'targetUid':targetUid, 'uid':uid})
        
        $('#chat-room').hide();
        $('#private-chat').show();

        client.event.subscribe('private-chat/' + uid, function(message){
            console.log(message.sender + " says: " + message.content)
        });

        $('#private-chat-send').on('click',function(){
            var content = $('#private-chat-content').val()
            client.event.emit('private-chat/' + uid, {'sender':users.get()[uid]['firstname'], 'content':content})
        })

    });
})