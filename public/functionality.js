window.onload =  function(){
    document.getElementById("create_call_btn").addEventListener("click", function(){
        if(checkNameIsNotEmpty()){
            window.location='/login';
        }
    });

    document.getElementById("join_call_btn").addEventListener("click", function(){
        if(checkNameIsNotEmpty()){
            if(checkCodeIsNotEmpty()){
                const room_code = document.getElementById("code_input").value;
                console.log(room_code);
                window.location=`/${room_code}`;
            }
        }
    });
}

function checkNameIsNotEmpty(){
    const name = document.getElementById("name_input").value;
    if(name !== ""){
        return true;
    }
    showWarningMessageName();
    return false;
}

function checkCodeIsNotEmpty(){
    const code = document.getElementById("code_input").value;
    if(code !== ""){
        return true;
    }
    showWarningMessageCode();
    return false;
}

function showWarningMessageName(){
    document.getElementById("name_warning").innerHTML = "Please put your name first";
    setTimeout(function(){
        document.getElementById("name_warning").innerHTML = "";
    },1500);
}

function showWarningMessageCode(){
    document.getElementById("code_warning").innerHTML = "Please put room code";
    setTimeout(function(){
        document.getElementById("code_warning").innerHTML = "";
    },1500);
}