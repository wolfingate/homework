const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../db_connect2');
const moment = require('moment-timezone');
const { relativeTimeRounding } = require('moment-timezone');
const email_pattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;


router.use((req, res, next)=>{
            console.log('ab: ', req.url);
            const whiteList = ['login', 'list'];
            if(req.session.adminUser){
                next();
            } else {
                let u = req.url.split('?')[0];
                u = u.split('/')[1];
               console.log('u:', u);
               console.log('u2:', whiteList.indexOf(u));
                if(whiteList.indexOf(u) === -1){
                    // 如果沒有在白名單內
                    return res.redirect('/');
                } else {
                    next();
                }
            }
        });







router.get('/', (req, res) => {
        res.redirect('/address-book/list');
});


router.get('/login', (req, res) => {
        res.render('address-book/login');
});

router.post('/login', async (req, res) => {
        const output = {
                success: false,
                info: '帳號或密碼錯誤'
        };
            const sql = "SELECT * FROM admins WHERE account=? AND password=SHA1(?)";
            const [result, fields] = await db.query(sql, [req.body.account, req.body.password]);
            console.log('result.length:',result.length)
            if(result.length){
                req.session.adminUser = result[0];
                output.success = true;
                output.info = '';
            }
            res.json(output);
});


router.get('/logout', (req, res) => {
        delete req.session.adminUser;

        if (req.get('Referer')) {
                res.redirect(req.get('Referer'));
        } else {
                res.redirect('/');
        }
});



router.get('/edit/:sid', async (req, res) => {
        const sql = "SELECT * FROM `address_book` WHERE sid=?";;
        const [result] = await db.query(sql, [req.params.sid]);
        // res.redirect('/address-book/list');
        if (result.length) {
                result[0].birthday = moment(result[0].birthday).format('YYYY-MM-DD');
                res.render('address-book/edit', { row: result[0] });
        }
        else {
                res.redirect('/address-book/list');
        }
});



router.post('/edit', async (req, res) => {
        const output = {
                success: false,
                body: req.body

        };
        // TODO: 檢查欄位的格式
        if (!email_pattern.test(req.body.email)) {
                output.error = 'Email 格式不符';
                return res.json(output);

        }

        const updateData = { ...req.body };
        const sid = updateData.sid;
        delete updateData.sid;// 刪除屬性

        const sql = "UPDATE `address_book` SET ? WHERE sid=?";
        const [result] = await db.query(sql, [updateData, sid]);

        if (result.changedRows === 1) {
                output.success = true;

        }



        output.result = result;
        res.json(output);

});



router.get('/del/:sid', async (req, res) => {
        const sql = 'DELETE FROM `address_book` WHERE sid=?';
        const [result] = await db.query(sql, [req.params.sid]);
        // res.redirect('/address-book/list');
        if (req.get('Referer')) {
                res.redirect(req.get('Referer'));
        }
        else {
                res.redirect('/address-book/list');
        }
});

router.get('/add', (req, res) => {
        res.locals.pageName = 'address-book-add';
        res.render('address-book/add');
});

router.post('/add', async (req, res) => {
        // const email_pattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        const output = {
                success: false,
                body: req.body

        };
        // TODO: 檢查欄位的格式
        if (!email_pattern.test(req.body.email)) {
                output.error = 'Email 格式不符';
                return res.json(output);

        }
        const sql = "INSERT INTO `address_book` SET ?";
        const [result] = await db.query(sql, [req.body]);

        if (result.affectedRows === 1 && result.insertId) {
                output.success = true;

        }



        output.result = result;
        res.json(output);

});




router.get('/list/:page?', async (req, res) => {
        res.locals.pageName = 'address-book-list';
        let page = parseInt(req.params.page) || 1;
        const perPage = 5; // 每一頁要顯示幾筆
        const output = {
                perPage,
                page,
                totalRows: 0,
                totalPages: 0,
                row: []

        };



        const t_sql = "SELECT COUNT(1) num FROM address_book "; //取得總筆數
        const [t_r] = await db.query(t_sql);
        output.totalRows = t_r[0].num; // 總筆數
        output.totalPages = Math.ceil(output.totalRows / perPage);// 總頁數



        // 如果沒有資料
        if (!output.totalRows) {
                // res.render('address-book/list', output);
                if (req.session.adminUser) {
                        res.render('address-book/list', output);
                } else {
                        res.render('address-book/list-no-admin', output);
                }
                return;
        };
        if (page < 1) {
                return res.redirect('/address-book/list/1');
        };
        if (page > output.totalPages) {
                return res.redirect('/address-book/list/' + output.totalPages);
        }





        const sql = `SELECT * FROM address_book ORDER BY sid DESC LIMIT ${(page - 1) * perPage}, ${perPage}`;
        // const sql = `SELECT * FROM address_book LIMIT ${(page - 1) * perPage}, ${perPage}`;
        console.log('sql:', sql);
        const [r] = await db.query(sql);

        r.forEach((element) => {
                element.birthday = moment(element.birthday).format(`YYYY-MM-DD`);


        });

        output.rows = r;
        // res.json(r);
        // res.render('address-book/list',{rows:r});
        // res.render('address-book/list', output);
        if (req.session.adminUser) {
                res.render('address-book/list', output);
        } else {
                res.render('address-book/list-no-admin', output);
        }
})

module.exports = router;