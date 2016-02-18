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
        var colors = ["greenyellow", "orange", "red", "orangered", "indianred", "steelblue", "gold", "darkgreen", "darkorange", "firebrick"]
        var color = colors[Math.floor((Math.random() * 10))];
        user.set({ 'firstname': name, 'lastname': lastname, 'color':color})
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
        var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
        var user = users.get()[data.uid]
        var li = $('<li>');
        li.append('<span style="color:' + user.color + ';">' + user.firstname + ' ' + user.lastname + ': </span>' + data.msg)
        $('#message-list').append(li)
        $('#chat-box').scrollTop($('#message-list').height()); // do not forget animation

        //console.log($('#message-list li').last().position().top + $('#message-list li').last().height())
        //$('#message-list').animate({ scrollTop: $(this).height() }, 1000);
        //console.log(user.firstname + " " + user.lastname + ": " + data.msg)
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