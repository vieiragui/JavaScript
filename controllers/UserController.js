class UserController {
    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;
            let values = this.getValues(this.formUpdateEl);
            
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];
            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, userOld, values);//sobrescreve o userOld

            this.getPhoto(this.formUpdateEl).then(
                (content) => {//se a leitura funcionar então execute o que esta aqui dentro. content é o caminho da img

                    if(!values.photo){
                        result._photo = userOld._photo;
                    }else{
                        result._photo = content;
                    }
                    
                    let user = new User();
                    user.loadFromJSON(result);
                    user.save();

                    this.getTr(user, tr);

                    this.updateCount();

                    btn.disabled = false;

                    this.showPanelCreate();
                    
                    this.formUpdateEl.reset();
                        this.formUpdateEl.reset();
                        btn.disabled = false;
            }, (e) => {//senão execute o que esta aqui dentro
                    console.error(e);
            });
        });
    }

    onSubmit() {

        this.formEl.addEventListener("submit", event => {
            event.preventDefault();//remove o evento padrão de refresh da pagina
            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true;
            let values = this.getValues(this.formEl); //os valores não estao vindo, exibindo false no console

            if(!values) {
                btn.disabled = false;
                return false
            };

            this.getPhoto(this.formEl).then((content) => {//se a leitura funcionar então execute o que esta aqui dentro. content é o caminho da img
                values.photo = content;
                //this.insert(values);
                values.save();
                this.addLine(values);
                this.formEl.reset();
                btn.disabled = false;
            }, (e) => {//senão execute o que esta aqui dentro
                console.error(e);
            });
        });
    }

    getPhoto(formEl) {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            let elements = [...formEl.elements].filter(item => {
                if (item.name === 'photo') {
                    //esta retornando <input type="file" id="exampleInputFile" name="photo">
                    return item;
                }
            });
            //console.log(elements); retorna uma coleção de input#exampleInputFile
            let file = elements[0].files[0]; //  esta pegando o primeiro elemento, e o primeiro arquivo desse elemento
            //console.log(file); retornando undefined qndo não tem img e quando tem retorna a img

            fileReader.onload = () => {//vai executar o que esta aqui dentro quando terminar de carregar o arquivo
                resolve(fileReader.result);      
            };

            fileReader.onerror = (e) => {
                reject(e);
            }
            
            if(file){
                fileReader.readAsDataURL(file);//Le o arquivo
            }else{
                resolve('dist/img/boxed-bg.png');
            }
            

        });

    }

    getValues(formEl) {
        let user = {};
        let isValid = true;
        /*formEl é uma referencia ao nome do formulario, ele esta recebendo o nome do formulario.
         *elements são os elementos do formulário. No terminal ao inserir o comando getElementById dentro de dir(), 
         *será mostrado os elementos serão listados na forma de objetos.
         *Então o código abaixo esta acessando o elementos do formulario e fazendo um forEach em cada um, esta pegando cada elemento
         */

        [...formEl.elements].forEach(function (field, index) { //é um array
            //console.log(field); retorna todos os elementos
            if(['name','email','password'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error');//add a classe has-error dentro do input name
                isValid = false;
            }
            //console.log(field.name); retorna todos os names das tags do formulario
            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value;
                }
            }else if(field.name == "admin"){
                user[field.name] = field.checked;
            }else if(field.name == ""){
                
            } else {
                user[field.name] = field.value;
            }
        });

        if(!isValid){
            return false; //para a execução
        }
        
        //console.log(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin); retorna false,
        //provavelmente o erro esta aqui, pois não esta conseguindo retornar os dados
        return new User(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin);
    }

    selectAll(){
        let users = User.getUsersStorage();//carrega a lista de usuários
        users.forEach(dataUser=>{
            let user = new User();
            user.loadFromJSON(dataUser);
            this.addLine(user);
        });

    }

    addLine(dataUser) {
        
        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);
        //document.getElementById("table-users").appendChild(tr);adiciona o conteúdo a cima dentro da tag que tem o id table-users
        this.updateCount();
    }

    getTr(dataUser, tr = null){//O 1º parametro tem que ser passado, se o segundo não for receberá null
        
        if(tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser); //o user é uma variavel que pode ter qualquer nome

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim':'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTR(tr);

        return tr;
    }

    addEventsTR(tr){//evento click, quando clicar montará novamente o tr
        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if(confirm("Deseja realmente excluir")){//retorna um booleano
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove();
                tr.remove();
                this.updateCount();
            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e=>{
            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;


            for(let name in json){
                let field = this.formUpdateEl.querySelector("[name="+ name.replace("_","") +"]");
                
                if(field){
                    switch(field.type){
                        case "file":
                        continue;
                        break;

                        case "radio":
                            field = this.formUpdateEl.querySelector("[name="+ name.replace("_", "") +"][value=" + json[name] + "]");
                            field.checked = true;
                        break;

                        case "checkbox":
                            field.checked = json[name];
                        break;

                        default:
                            field.value = json[name];
                    }
                }
            }
            this.formUpdateEl.querySelector(".photo").src = json._photo;
            this.showPanelUpdate();
        });
    }

    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    updateCount(){//Calcula o total de usuarios
        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {
            numberUsers++;
            let user = JSON.parse(tr.dataset.user);

            if(user._admin) numberAdmin++;
        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }
}