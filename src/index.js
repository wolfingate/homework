const express = require('express');
// const multer = require('multer');
// const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');
// const upload = multer({dest:'tmp_uploads/'});
const upload = require(__dirname + '/upload-module');

const session = require('express-session');

const moment = require('moment-timezone');

const Mysqlstore = require('express-mysql-session')(session);

const db = require(__dirname + '/db_connect2');

const sessionStore = new Mysqlstore({},db);

const app = express();




app.set('view engine', 'ejs');


// Top-level middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: 'qwertyuiopasdfghjklzxcvbnm123',
    saveUninitialized: false,
    resave: false,
    store:sessionStore,
    cookie: {   
        maxAge: 120000
    }
}));

// custom middleware
app.use((req, res, next) => {
    // req.session.adminUser={
    //     account:"Tim",
    //     nickname:"提姆"

    // };
     // 把 session 資料傳給樣版
    //  console.log('middleware: ', req.session);
     res.locals.sess=req.session;





    res.locals.pageName = '';
    res.locals.myVar = {
        name: 'David',
        age: 20
    };
    next()
})


app.get('/', (req, res) => {
    res.locals.pageName = 'home';
    res.render('main', {
        name: 'Peter'
    });
    // res.send('<h2>Hello Express</h2>');
    //res.end('<h2>Hello Express 2</h2>');
});

app.get('/sales', (req, res) => {
    const data = require(__dirname + "/../data/sales");
    console.log(data);
    res.json(data);
});

app.get('/json-sales', (req, res) => {
    const sales = require(__dirname + "/../data/sales");
    // console.log(data);
    // res.json(data);
    res.render('json-sales', { sales })

});

app.get('/try-qs', (req, res) => {
    res.json(req.query);
})





// const parser = express.urlencoded({extended:false});

app.get('/try-post-form', (req, res) => {
    res.render('try-post-form');
})

// app.post('/try-post-form',parser,(req,res)=>{
//         res.json(req.body);
//     })

app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);
    // res.json(req.body);
})



app.post('/try-upload', upload.single('avatar'), (req, res) => {
    res.json(req.file);
});


app.post('/try-upload-multiple', upload.array('myphoto', 10), (req, res) => {
    res.json(req.files);
});
// app.get('/try-uuid', (req, res)=>{
//     res.json({
//         a:uuid.v4(),
//         b:uuid.v4()
//     });
// });

app.get('/try-uuid', (req, res) => {
    res.json({
        a: uuidv4(),
        b: uuidv4()
    });
});


app.post('/try-post', (req, res) => {
    req.body.加料 = '哈囉';
    res.json(req.body);
});


app.get('/pending', (req, res) => {
});

// app.get('/a.html', (req, res)=>{
//     res.send('<h2>假的 a.html</h2>');
// });

app.get('/my-params1-1/:action/:id', (req, res) => {
    res.json(req.params)
}),

app.get('/my-params1-2/:action?/:id?', (req, res) => {
        res.json({
            locals: res.locals,
            params: req.params,
            session: req.session
        });
    }),
app.get('/my-params1-3/*?/*?', (req, res) => {
        res.json(req.params)
    }),
    //


    app.get(/^\/m\/09\d{2}-?\d{3}-?\d{3}$/, (req, res) => {
        let u = req.url;
        u = u.slice(3).split("-").join("");
        u = u.split("?")[0];
        res.json({
            url: req.url,
            手機: u
        })
    })




// app.get('/try-db', (req, res) => {
//     const sql = "SELECT * FROM address_book";
//     db.query(sql)
//         .then(([r]) => {
//             res.json(r);
//         });
// });

app.get('/try-db', (req, res) => {
    const sql = "SELECT * FROM address_book";
    db.query(sql)
        .then(([r]) => {
            res.json(r);
        });
});

//promise =>async, await
app.get('/try-db2', async (req, res) => {
    const sql = "SELECT * FROM address_book";
    const [results,fields] = await db.query(sql);
    res.json(results);
});


app.get('/add',(req, res) => {
    res.render('address-book/add');
});



const admin2Router = require(__dirname + '/routes/admin2');
app.use('/admins', admin2Router);


// app.use('/admins',require(__dirname+'/routes/admin2'))



app.get('/try-session', (req , res , next) => {
    req.session.my_Var = req.session.my_Var || 0;
    req.session.my_Var++;
    res.json({
        my_Var: req.session.my_Var,
        session: req.session
    })

});



app.get('/try-moment', (req , res , next) => {
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const mo1 = moment(req.session.cookie.expires);
    const mo2 = moment(new Date());

    res.json({
        'local_mo1':mo1.format(fm),
        'local_mo2':mo2.format(fm),
        'london_mo1':mo1.tz('Europe/London').format(fm),
        'london_mo2':mo2.tz('Europe/London').format(fm),
})

});




app.use('/address-book',require(__dirname+'/routes/address-book'));


app.use(express.static('public'));


app.use((req, res) => {
    res.status(404).send('<h2>找不到頁面</h2>')
});

app.listen(3000, () => {
    console.log('server started!');
})