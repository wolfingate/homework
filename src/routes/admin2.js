const express = require('express');
const router = express.Router();

router.get('/admin2/:action?/:id?',(req,res)=>{
    res.json({
        locals:res.locals,
        params:req.params,
        url:req.url,
        baseUrl:req.baseUrl        
    });

})

module.exports = router;