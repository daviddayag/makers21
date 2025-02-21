const { DeepstreamClient } = window.DeepstreamClient
const client = new DeepstreamClient('0.0.0.0:6020')
client.login()
const uuid = client.getUid();

client.event.subscribe('tick', (data) => {
    console.log(`tick ${data}`);
})

client.on('error', (error, event, topic) => {
    console.log(error, event, topic);
})

client.on('connectionStateChanged', connectionState => {
    // will be called with 'OFFLINE' once the connection is successfully paused.
})

/////////////////////////////////////////////////////
function sendEvent(name, data){
    data.id = uuid;    
    client.event.emit(name, data);
} 


/////////////////////////////////////////////////////
function subscribe(name, handler){    
    client.event.subscribe(name, (data)=>{
        if (data.id == uuid) {
            return;
        }
        handler(data);
    }); 
}

function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
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

setInterval(() => {
    client.event.emit('heartbeat', uuid);
}, 5000);


window.deepStream = {
    sendThrot : throttle(sendEvent, 10),
    sendEvent:sendEvent,
    subscribe: subscribe    
}

