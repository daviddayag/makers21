const { DeepstreamClient } = window.DeepstreamClient
const client = new DeepstreamClient('10.11.11.66:6020')
client.login()
var uuid = client.getUid();


client.event.subscribe('tick', (data)=> {
    console.log(`tick ${data}`);
})

client.on('error', ( error, event, topic ) => {
    console.log(error, event, topic);
})

client.on('connectionStateChanged', connectionState => {
    // will be called with 'OFFLINE' once the connection is successfully paused.
})

function sendPos(pos) {
    client.event.emit('player.move', {x:pos.x, y:pos.y, z:pos.z, p: uuid, ts: Date.now() });
}

client.event.subscribe('player.move', data => {
    console.log(`> player.move ${data.x}|${data.y}|${data.z}|p:${data.p}`);
})


function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};




window.networkLayer = {
    sendPos: throttle(sendPos,200)
}

