

var nofMessages = 3000; //number of 'time messages' for each connected Device
var sleepInterval = 20; //interval between sending message to the same Device
function initialize() {
    /*
    Connection handling
     */
    XDmvc.init();
    XDmvc.reconnect = false;
    XDmvc.setClientServer();
    XDmvc.connectToServer();
    updateDevices();
    $("#myDeviceId").text(XDmvc.deviceId);
    $("#inputDeviceId").val(XDmvc.deviceId);


    $("#showDevices").on("click", function(){
        updateDevices();
        return false;
    });

    $("#changeId").on("click", function(){
        $("#deviceId").toggle();
        $("#deviceId").removeClass("has-error");
        return false;
    });


    $("#deviceIdButton").on("click", function(){
        var newId = $("#inputDeviceId").val();
        if (newId) {
            XDmvc.changeDeviceId(newId);
            $("#deviceId").toggle();
            $("#myDeviceId").text(XDmvc.deviceId);
        } else {
            $("#deviceId").addClass("has-error");
        }
        return false;
    });

    document.addEventListener('XDConnection', function(event){
        addConnectedDevices()
    });
    document.addEventListener('XDdevice', function(event){
        updateDevices();
    });


    /*
    Time measurement
     */


    $("#runTest").on("click", function(){
        for(var i = 0; i < nofMessages; i++) {
            window.setTimeout(runTests, sleepInterval*i);
        }
        graph();
        return false;
    });

}

function runTests() {
    XDmvc.connectedDevices.forEach(function(device) {
        device.send('time', {});
    });
}

function updateDevices() {
    XDmvc.server.requestAvailableDevices();
    window.setTimeout(addAvailableDevices, 1000);
    window.setTimeout(addConnectedDevices, 1000);
}

function addAvailableDevices() {
    // list container
    var listContainer = $('#availableDeviceList');
    listContainer.empty();
    for (var i=0; i<XDmvc.availableDevices.length; i++) {
        var dev = XDmvc.availableDevices[i];
        listContainer.prepend('<a href="#" class="list-group-item">'+dev.id+'</a>');
    }
    // add onclick listener
    $("#availableDeviceList a").click(function() {
        XDmvc.connectTo($(this).text());
        $(this).remove();
    });
}

function addConnectedDevices() {
    // list container
    var listContainer = $('#connectedDeviceList');
    listContainer.empty();
    for (var i=0; i<XDmvc.connectedDevices.length; i++) {
        var dev = XDmvc.connectedDevices[i];
        listContainer.prepend('<li class="list-group-item">'+dev.id+'</li>');
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    initialize();
});

function graph(){

    // We use an inline data source in the example, usually data would
    // be fetched from a server

    var data = [],
        totalPoints = 300;

    function getData() {

        var res = [];
        XDmvc.connectedDevices.forEach(function(device) {
            var arr = device.timeStamps;
            var data = arr.slice(Math.max(arr.length - totalPoints, 0));
            // Zip the generated y values with the x values
            var resDevice = [];
            for (var i = 0; i < data.length; ++i) {
                resDevice.push([i, data[i]])
            }
            res.push({data: resDevice});
        });

        return res;
    }

    var plot = $.plot("#placeholder",  getData() , {
        series: {
            shadowSize: 0	// Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 100
        },
        xaxis: {
            show: false
        }
    });

    function update() {

        plot.setData(getData());

        // Since the axes don't change, we don't need to call plot.setupGrid()
        plot.setupGrid();
        plot.draw();
        setTimeout(update, sleepInterval);
    }

    update();
}