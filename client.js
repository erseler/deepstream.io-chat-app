//js goes here
client = deepstream( 'localhost:6020' ).login();
var uid = client.getUid()
console.log('client connected');

var users = client.record.getRecord( 'users' );
var user = client.record.getRecord('user');

$(document).ready(function(){
    $('#chat-room').hide();
    $('#private-chat').hide();
    $('#login-form').submit(function(e){
        e.preventDefault();
        console.log("button pressed!")

        var name = $('#name').val();
        var lastname = $('#lastname').val();
        var colors = ["indigo", "orange", "red", "orangered", "indianred", "steelblue", "darkgreen", "darkorange", "firebrick" ,"blueviolet"]
        var color = colors[Math.floor((Math.random() * 10))];
        user.set({ 'firstname': name, 'lastname': lastname, 'color':color})
        users.set(uid, user.get())

        $('#login-page').hide();
        $('#user-profile').text(user.get()['firstname'] + " " + user.get()['lastname'])
        $('#user-profile').css('color', user.get()['color'])
        for(var key in users.get()){
            var li = $('<li>')
            if(key!=uid){
                li.attr('id', key) 
                li.text(users.get()[key]['firstname'] + " " + users.get()[key]['lastname'])
                li.css('color', users.get()[key]['color'])
                li.css('margin-bottom','5px')
                li.hover(function(){
                    $(this).css('cursor','pointer')
                })
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
                    li.css('color', users.get()[key]['color'])
                    li.hover(function(){
                        $(this).css('cursor','pointer')
                    })
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
        var li = $('<li>');
        li.append('<span style="color:' + user.color + ';">' + user.firstname + ' ' + user.lastname + ': </span>' + data.msg)
        $('#message-list').append(li)
        $('.chat-box').scrollTop($('#message-list').height()); // do not forget animation

        //console.log($('#message-list li').last().position().top + $('#message-list li').last().height())
        //$('#message-list').animate({ scrollTop: $(this).height() }, 1000);
        //console.log(user.firstname + " " + user.lastname + ": " + data.msg)
    })    

    $('#post-msg-form').submit(function(e){
        e.preventDefault();
        var msg = $('#msg-content').val()
        $('#msg-content').val('');
        client.event.emit( 'chat', {'msg':msg, 'uid':uid});
    })
    //////////////////////////////////////////////////////////////////
    /////////               PRIVATE CHAT
    //////////////////////////////////////////////////////////////////
    client.event.subscribe('chat-request',function(data){
        if(data.targetUid==uid){
            /* 
            if (confirm(users.get()[data.uid]['firstname'] + ' ' + users.get()[data.uid]['lastname'] + 'has sent you a chat request?')) {
                // Save it!
            } else {
                // Do nothing!
            }
            */
            var targetUser = users.get()[data.uid]
            $('#chat-room').hide();
            $('#private-chat').show();
            $('#chat-user-head').append('Chat with: ' + '<span style="color:' + targetUser.color + ';">' + targetUser.firstname + ' ' + targetUser.lastname + '</span>')
            client.event.subscribe('private-chat/' + data.uid, function(message){     
                var user = users.get()[message.sender]
                var li = $('<li>');
                li.append('<span style="color:' + user.color + ';">' + user.firstname + ' ' + user.lastname + ': </span>' + message.content)
                $('#private-message-list').append(li)
                $('.chat-box').scrollTop($('#private-message-list').height());
            })

            $('#private-chat-form').submit(function(e){
                e.preventDefault();
                var content = $('#private-chat-content').val()
                $('#private-chat-content').val('')
                client.event.emit('private-chat/' + data.uid, {'sender':uid, 'content':content})
            })
            
        }
    })

    $("#users-list").on('click', 'li', function(event) {
        var targetUid = event.target.id;     
        var targetUser = users.get()[targetUid]      
        client.event.emit('chat-request', {'targetUid':targetUid, 'uid':uid})
        
        $('#chat-room').hide();
        $('#private-chat').show();
        $('#chat-user-head').append('Chat with: ' + '<span style="color:' + targetUser.color + ';">' + targetUser.firstname + ' ' + targetUser.lastname + '</span>')
        client.event.subscribe('private-chat/' + uid, function(message){
            var user = users.get()[message.sender]
            var li = $('<li>');
            li.append('<span style="color:' + user.color + ';">' + user.firstname + ' ' + user.lastname + ': </span>' + message.content)
            $('#private-message-list').append(li)
            $('.chat-box').scrollTop($('#private-message-list').height());
        });

        $('#private-chat-form').submit(function(e){
            e.preventDefault();
            var content = $('#private-chat-content').val()
            $('#private-chat-content').val('')
            client.event.emit('private-chat/' + uid, {'sender':uid, 'content':content})
        })

    });
})