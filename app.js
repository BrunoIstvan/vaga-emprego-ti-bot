var express = require('express');
var mongo = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Conexão com o MongoDB
var mongoaddr = 'mongodb://root:n123456@ds239206.mlab.com:39206/demo-produtos';
console.log(mongoaddr);
mongo.connect(mongoaddr);

//Esquema da collection do Mongo
var taskListSchema = mongo.Schema({
    cargo: { type: String },
    nivel: { type: String },
    salario: { type: String },
    cidade: { type: String },
    nomeEmpresa: { type: String },
    formaContratacao: { type: String },
    link: { type: String },

});

//Model da aplicação
var Model = mongo.model('vagas', taskListSchema);


//GET - Retorna todos os registros existentes no banco
app.get("/api/vagas", function (req, res) {
    Model.find(function (err, todos) {
        if (err) {
            res.json(err);
        } else {
            //res.json(todos);
            res.setHeader('Content-Type','application/json')
            res.send(JSON.stringify({
                "fulfillmentText": todos
            }))
        }
    })
});

// DELETE - Apaga um registro pelo id
app.delete("/api/vaga/:id", function(req, res) {
    Model.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

// POST - Adiciona um registro
app.post("/api/vaga", function (req, res) {  
    console.log(req.body)
    var register = new Model({
        'cargo': req.body.cargo,
        'nivel': req.body.nivel,
        'salario': req.body.salario,
        'cidade': req.body.cidade,
        'nomeEmpresa': req.body.nomeEmpresa,
        'formaContratacao': req.body.formaContratacao,
        'link': req.body.link,

    });
    register.save(function (err) {
        if (err) {
            console.log(err);
            res.send(err);
            res.end();
        }
        res.setHeader('Content-Type','application/json')
        res.send(JSON.stringify({
            "fulfillmentstatusText": "reservado"
        }))
    });
});


//POST - Consulta um registro
app.post("/api/vaga/consulta", function (req, res) {  

    var cargo = req.body.queryResult.parameters.cargo;
    var nivel = req.body.queryResult.parameters.nivel;
    var cidade = req.body.queryResult.parameters.geo_city;

    var busca = {
        'cargo': { $regex: '.*' + cargo + '.*' },
        'nivel': { $regex: '.*' + nivel + '.*' },
        'cidade': { $regex: '.*' + cidade + '.*' }
    };
    if(busca.nivel === '' || busca.nivel == undefined) {
        delete busca.nivel;
    }
    console.log(busca);
    Model.find(busca, function (err, todos) {
        if (err) {
            res.json(err);
        } else {
            //res.json(todos);
            console.log(todos)
            var array = []
            todos.map(v => {
                var string = `Cargo: ${v.cargo} (${v.formaContratacao})
                      Nível: ${v.nivel} 
                      Cidade: ${v.cidade}
                      Empresa: ${v.nomeEmpresa}
                      Salário: ${v.salario} 
                      Link da vaga: ${v.link}`
                array.push(string)
            })
            var resp = array.toString().replace(/,/g, "\n\n")
            console.log(resp)
            res.setHeader('Content-Type','application/json')
            res.send(JSON.stringify({
                "fulfillmentText":resp
            }))
            // res.send(JSON.stringify({
            //     "fulfillmentText": 
            //     todos.map(v => {
            //         console.log(v)
            //         var array = []
            //         var string = `Cargo: ${v.cargo} 
            //              Nível: ${v.nivel} 
            //              Cidade: ${v.cidade}
            //              Empresa: ${v.nomeEmpresa}
            //              Salário: R$${v.salario.toFixed(2)} 
            //              Link da vaga: ${v.link},`
            //         array.push(string)
            //        var teste =  array.toString().replace(',', '\n')
            //        console.log(teste)
            //         return teste
            //     })          
                    // todos.map(v=>(
                    //     `Cargo: ${v.cargo} 
                    //     Nível: ${v.nivel} 
                    //     Cidade: ${v.cidade}
                    //     Empresa: ${v.nomeEmpresa}
                    //     Salário: R$${v.salario.toFixed(2)} 
                    //     Link da vaga: ${v.link}`
                    // ))
                        
                
            
        }
    })
});

//PUT - Atualiza um registro
app.put("/api/vaga/:id", function (req, res) {
    Model.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) {
            return next(err);
        } else {
            res.json(post);
        }
    });
});

//DELETE - Deleta um registro
app.delete("/api/reserva/:id", function (req, res) {
    Model.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


//Porta de escuta do servidor
app.listen(8080, function () {
    console.log('Funcionando');
});


