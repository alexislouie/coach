var MOCK_PROFILE_DATA = {
    "id": 111111,
    "firstName": "Alexis",
    "lastName": "Louie",
	"userName": "alouie1020",
    "programs": [
        {
            "id": 1230984921,
            "name": "7 Days of Dumbbells",
            "author": "alouie1020",
            "publishedAt": 1470009976609
        },
        {
            "id": 4329032,
            "name": "Back and Biceps",
            "author": "alouie1020",
            "publishedAt": 1470009976611
        },
    ],
    "savedPrograms": [
        {
            "id": 3908141,
            "name": "Beginner Boxing",
            "author": "MT445",
            "publishedAt": 1470009976612
        },
        {
            "id": 43928910,
            "name": "Kizen Free 4-wk Trial",
            "author": "bkwan23",
            "publishedAt": 1470009976613
        },
    ]
}

function getProfileData(callback) {
    setTimeout(function() { callback(MOCK_PROFILE_DATA)}, 100);
}

function displayProfileData(data) {
    $('body').append(
        `Welcome Back ${data.userName}!`
        // More info here about user data
    )
    for (index in data.profileInfo) {
        $('body').append(
            'p' + data.profileInfo[index].text + '</p>');
    }
}

function getAndDisplayProfileData() {
    getProfileData(displayProfileData);
}

$(function() {
    getAndDisplayProfileData();
})


//Data Provided for Queried Data:  
// Example: All Programs by alouie1020
var MOCK_PROGRAM_DATA = [
    {
        "id": 1230984921,
        "name": "7 Days of Dumbbells",
        "author": "alouie1020",
        "length": 7,
        "publishedAt": 1470009976609
    },
    {
        "id": 1230984922,
        "name": "30 days to Advance Climbing",
        "author": "alouie1020",
        "length": 30,
        "publishedAt": 1470009975700
    },
]
    
