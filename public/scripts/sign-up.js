function handleSignUp() {
    $('.signup-section').on('click', '.js-signup-button', function (event) {
        event.preventDefault();

        const regUser = {};
        regUser['firstName'] = $('#reg-firstName').val();
        regUser['lastName'] = $('#reg-lastName').val();
        regUser['userName'] = $('#reg-userName').val();
        regUser['password'] = $('#reg-password').val();
        console.log(regUser);

        createUser(regUser);
    });

}

function createUser(info) {
    fetch('http://localhost:8080/users/register',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(info)
        })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(console.log)
}

function handleLogin() {
    $('.login-section').on('click', '.js-login-button', function (event) {
        event.preventDefault();

        const user = {};
        user['username'] = $('#login-username').val();
        user['password'] = $('#login-password').val();
        console.log(user);

        loginUser(user);
    })
}

function loginUser(user) {
    fetch('/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(res => {
            // const bearer = res.authToken;
            localStorage.setItem('authToken', res.authToken);
            localStorage.setItem('userId', res.userId);
            alert('authToken = ' + localStorage.getItem('authToken'))
        })

}

handleSignUp();
handleLogin();