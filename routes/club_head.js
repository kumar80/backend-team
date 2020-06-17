const connection = require('../server')
const crypto = require('crypto')
const path = require('path')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')

const uri = 'mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/techsite?retryWrites=true&w=majority'
let gfs
connection.once('open', () => {
  console.log('MongoDB database connection established successfully')
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
})

const storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err)
        }
        const filename = buf.toString('hex') + path.extname(file.originalname)
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        }
        resolve(fileInfo)
      })
    })
  }
})

const upload = multer({ storage,
fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    // png jpg gif and jpeg allowed
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      //enable this line if abort should be aborted || currently the file is just ignored & not sent for upload
        // return callback(new Error('Only images are allowed'))              
        return callback(null, false)

    }
    callback(null, true)
},
  limits:{
      fileSize: 50 * 1024 // 50 Mb limit imposed
  } 
})



//for rendering password page
router.route('/change_password').get((req,res)=>{
    res.render('password')
})

// route for changing the password
router.route('/password/change').post((req,res)=>{
    var pswd = req.body.pswd
    Users.findByIdAndUpdate(req.session._id,{pswd:pswd})
    .then(()=>{
      res.redirect(307,'/users/')
    }).catch(err=>{
      res.json(err)
    })
})

// route to create club
router.route('/club_head/create').post((req,res)=>{})

// route to render club create page
router.route('/club_head/create').get((req,res)=>{})

// route for updating profile
router.route('/profile/').post( upload.single('profpic'), function (req, res, next) {
    var sess = req.session
    const id = req.session._id
    const uid = req.params.id
    var dpurl = req.body.dp_url
  
    if (req.file != undefined) {
      dpurl = req.file.filename
    }
    const change = {
      // pswd: req.body.pswd,
      dp_url: dpurl,
      name: req.body.name,
      contact: req.body.contact,
      email_id: req.body.email_id,
      bio: req.body.bio
    }
    sess.dp_url = dpurl
    sess.email_id = req.body.email_id
    sess.contact = req.body.contact
    sess.name = req.body.name
    sess.bio = req.body.bio
    Users.findByIdAndUpdate(id, change)
      .then(() => {
        res.render('public_landing', {
          id: sess._id,
          club_name: sess.club_name,
          name: sess.name,
          user_id: sess.user_id,
          pswd: sess.pswd,
          email_id: sess.email_id,
          contact: sess.contact,
          bio: sess.bio,
          dp_url: sess.dp_url
        })
      }).catch(err => {
        res.json(err)
      })
})

// for rendering update profile 
router.route('/profile/').get((req, res) => {
    // turn on the projections as per necessity
    Users.findById(req.session._id)
      .then(user => {
        res.render('updateprof',{user:user})
      }).catch((err) => {
        res.json(err)
      })
})

// route for rendering profile and action page
router.route('/').post((req, res) => {
    // console.log(req.body);
    sess = req.session
  
    if (sess.user_id) {
      return res.render('public_landing', {
        id: sess._id,
        club_name: sess.club_name,
        name: sess.name,
        user_id: sess.user_id,
        pswd: sess.pswd,
        email_id: sess.email_id,
        contact: sess.contact,
        bio: sess.bio,
        dp_url: sess.dp_url
      })
    }
    const user_id = req.body.user_id
    const pswd = req.body.pswd
    const user = { user_id, pswd }
    Users.find(user)
      .then(user => {
        if (user.length === 1) {
          sess._id = user[0]._id
          sess.club_name = user[0].club_name
          sess.name = user[0].name
          sess.user_id = user[0].user_id
          sess.pswd = user[0].pswd
          sess.email_id = user[0].email_id
          sess.contact = user[0].contact
          sess.bio = user[0].bio
          sess.dp_url = user[0].dp_url
  
          res.render('public_landing', {
            id: user[0]._id,
            club_name: user[0].club_name,
            name: user[0].name,
            user_id: user[0].user_id,
            pswd: user[0].pswd,
            email_id: user[0].email_id,
            contact: user[0].contact,
            bio: user[0].bio,
            dp_url: user[0].dp_url
  
          })
        } else {
          // res.redirect('/')
          res.render('index', { alerts: 'Wrong Username / Password' })
        }
      }).catch((err) => {
        res.render('index', { alerts: 'Invalid Request' })
        // res.json('Error: ' + err)
      })
})


router.get('/image/:filename', (req, res) => {
    const file = gfs
      .find({
        filename: req.params.filename
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({
            err: 'no files exist'
          })
        }
        gfs.openDownloadStreamByName(req.params.filename).pipe(res)
      })
})

router.post('/image/del/:img', (req, res) => {
    gfs.delete(new mongoose.Types.ObjectId(req.params.img), (err, data) => {
      if (err) return res.status(404).json({ err: err.message })
      res.status(200)
    })
})
  