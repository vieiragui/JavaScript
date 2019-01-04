/*window.addEventListener('focus',event=>{
    console.log("focus");
}); 

document.addEventListener('click',event =>{
    console.log('click');
});*/

/*let agora = new Date();
console.log(agora.toLocaleDateString("pt-BR"));*/

/*let outroCarro = ["teste","teste01","teste02"]
outroCarro.forEach(function(value,index){
    console.log(index,value);
});*/

let celular = function(){
    this.cor = "preto";
    this.ligar = function(){
        console.log("Uma ligação");
    }
}
let objeto = new celular();
console.log(objeto.ligar());