const router = require('express').Router()
const clubmodel = require('../models/Club.model.js')
const usermodel = require('../models/Users.js')
const achievementModel = require('../models/Achievement.model')
const superAdminModel = require('../models/SuperAdmin.model')
const projectmodel = require('../models/Project.model.js')
var upload = require('./images');

var sess

router.route('/').post((req, res) => {
  sess = req.session
  console.log(sess.user_id)
  if (sess.user_id) {
    admins = {
      _id: sess._id,
      name: sess.name,
      user_id: sess.user_id,
      email_id: sess.email_id,
      contact: sess.contact
    }

    return res.render('admin_landing', { admin: admins })
  }

  const user_id = req.body.user_id
  const pswd = req.body.pswd
  const admin = { user_id, pswd }
  superAdminModel.find(admin)
    .then(admin => {
      if (admin.length === 1) {
        sess._id = admin[0]._id
        sess.name = admin[0].name
        sess.user_id = admin[0].user_id
        sess.email_id = admin[0].email_id
        sess.contact = admin[0].contact
        // site to redirect to on login success : ! Change to valid Get route -> view with admin features
        res.render('admin_landing', { admin: admin[0] })
      } else {
        // user doesnt have admin privileges (Show UI popup) , may redirect to user login
        // res.status(200).send('Sorry you donot have admin privileges !')
        res.render('index', { alerts: 'Sorry you donot have admin privileges !' })
      }
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})

router.route('/club/delete').delete((req, res) => { // this route will help in deleting a club
  const club = req.body.club_name

  clubmodel.deleteMany({ name: club }, (err) => {
    console.error.bind(console, 'not deleted')
  })
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(club)
})

router.route('/club_head/reset/:id').get((req, res) => { // by this route the club-head values will be set on default which can be changed by thhe club-head later on
  const club_head_id = req.params.id
  usermodel.findById(club_head_id)
    .then(user => {
      const l_club_name = user.club_name.toLowerCase()
      usermodel.findByIdAndUpdate(user._id, {
        pswd: l_club_name,
        name: '',
        contact: '',
        email_id: '',
        dp_url: '',
        bio: ''
      })
        .then(() => {
          res.redirect('/admin/clubs/retrieve')
        }).catch(err => {
          res.json(err)
        })
    }).catch(err => {
      res.json(err)
    })
})

router.route('/achievement/create/').get((req, res) => {
  res.render('create_achievement')
})

router.route('/achievement/view/:id').get((req, res) => { // for displaying the achivement by using its id
  const id = req.params.id
  achievementModel.findById(id)
    .then(achievement => {
      res.status(200).json(achievement)
    }).catch(err => {
      res.status(400).send('Does not exist')
    })
})

router.route('/achievement/update/:id').get((req, res) => {
  achievementModel.findById(req.params.id)
    .then(ach => {
      res.render('update_achievement', { ach: ach })
    }).catch(err => {
      res.status(404).send('Does nit exist')
    })
})

router.route('/clubs/retrieve').get((req, res) => {
  clubmodel.find()
    .then(clubs => {
      res.render('view_club_heads', {
        clubs: clubs
      })
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})

router.route('/profile/update/:id').get((req, res) => {
  superAdminModel.findOne({ _id: req.params.id })
    .then(admin => {
      res.render('admin_updateprof', { id: req.params.id, user_id: admin.user_id,name: admin.name,contact:admin.contact ,email_id:admin.email_id })
    })
})

router.route('/profile/update/:id').post((req, res) => {
  var sess = req.session
  sess.name = req.body.name
  sess.email_id = req.body.email_id
  sess.contact = req.body.contact

  const change = {
    name: req.body.name,
    contact: req.body.contact,
    email_id: req.body.email_id
  }

  admin = {
    _id: sess._id,
    name: sess.name,
    user_id: sess.user_id,
    email_id: sess.email_id,
    contact: sess.contact
  }
  superAdminModel.findByIdAndUpdate(req.params.id, change)
    .then(() => {
      res.render('admin_landing', { admin: admin })
    }).catch(err => {
      res.json(err)
    })
})

router.route('/create_club/').get((req, res) => {
  res.render('create_club')
})

router.route('/project_details').get((req, res) => {
  projectmodel.find()
    .then(projects => {
      res.render('project_details', { projects: projects, _id: sess._id })
    }).catch(err => {
      res.status(404).send(err)
    })
})
router.route('/create_project/:id').get((req, res) => {
  superAdminModel.find({ _id: req.params.id })
    .then(admin => {
      if (admin.length === 1) {
        res.render('create_project', { id: req.params.id })
      } else {
        res.send('you dont have admin privilages')
      }
    }).catch(err => {
      res.status(404).send(err)
    })
})
router.route('/club/update/:id').get((req, res) => {
  const club_id = req.params.id
  clubmodel.findById(club_id)
    .then(club => {
      res.render('update_club', { club: club })
    }).catch(err => {
      res.json(err)
    })
})

router.route('/projects/delete/:id').get((req, res) => {
  const project_id = req.params.id
  projectmodel.findByIdAndDelete(project_id)
    .then(() => {
      res.redirect('/admin/project_details')
    }).catch(err => {
      res.json(err)
    })
})

router.route('/achievement/create/').get((req, res) => {
  res.render('create_achievement')
})

router.route('/achievements/delete/:id').get((req, res) => {
  const achievement_id = req.params.id
  achievementModel.findByIdAndDelete(achievement_id)
    .then(() => {
      res.redirect('/admin/achievement')
    }).catch(err => {
      res.json(err)
    })
})

router.route('/achievement/').get((req, res) => {
  achievementModel.find()
    .then(achievements => {
      res.render('view_achievement', { achievements })
    })
})

router.route('/achievement/edit/:id').get((req, res) => {
  const acv_id = req.params.id
  achievementModel.findById(acv_id)
    .then(achievement => {
      res.render('update_achievement', { ach: achievement })
    })
})
router.route('/achievement/update/:id').post( upload.any('pics', 20), (req, res) => { // for updating the achievement of a given id
  const id = req.params.id
  var pics_url
  if (req.files != undefined) {
    pics_url = req.files.map((file) => {
      return file.filename
    })
  }

  var achievement = {
    title: req.body.title,
    caption: req.body.caption,
    description: req.body.des,
    pics_url: pics_url
  }

  achievementModel.findByIdAndUpdate(id, achievement)
    .then(() => {
      res.status(200).send('Achievement updated successfully')
    }).catch(err => {
      res.status(400).send(err)
    })
})
// to create achievement and upload it into database
router.route('/achievement/create/').post(upload.any('snapshot_url', 20), (req, res) => {
  var pics_url = []

  if (req.files != undefined) {
    pics_url = req.files.map((file) => {
      return file.filename
    })
  }

  var acheievement = new achievementModel({
    title: req.body.title,
    caption: req.body.caption,
    description: req.body.des,
    pics_url: pics_url
  })

  acheievement.save((err, ach) => {
    if (err) res, json(err)
    res.redirect('/admin/achievement/')
  })
})

router.route('/update_project/:id').get((req,res)=>{
  const proj_id = req.params.id
  projectmodel.findById(proj_id)
  .then(project=>{
    res.render('project_update',{project:project})
  })
})

// this route handle project creation currently i have set a arbitrary maximum of 20 images simultaneously
// change as per necessity
router.route('/project/create').post( upload.any('snapshot_url', 20),  (req, res, next) => {
  var snaps = []
  // console.log(req.files);
  if (req.files != undefined) {
    snaps = req.files.map(function (file) {
      return file.filename
    })
  }
  var project = new projectmodel({
    title: req.body.title,
    team_members: req.body.team_member,
    description: req.body.description,
    branch: req.body.branch,
    club: req.body.club,
    degree: req.body.degree,
    snapshot_url: snaps
  })

  project.save((err) => {
    console.error.bind(console, 'saving of project not done yet!')
  })
  // const id = req.body.id
  res.redirect('/admin/project_details')
})

router.route('/update_project/:id').post( upload.any('pics', 20), (req, res) => {
  const id = req.params.id
  var snapshots_url
  if (req.files != undefined) {
    snapshots_url = req.files.map((file) => {
      return file.filename
    })
  }

  var change = {
    title: req.body.title,
    team_members: req.body.team_member,
    description: req.body.description,
    branch: req.body.branch,
    club: req.body.club,
    degree: req.body.degree,
    snapshot_url: snapshots_url
  }

  projectmodel.findByIdAndUpdate(id, change)
    .then(() => {
      res.redirect('/admin/project_details/')
    }).catch(err => {
      res.status(400).send(err)
    })
})

router.route('/club/view/:id').get((req, res) => {
  const club_head_id = req.params.id
  usermodel.findById(club_head_id)
    .then(user => {
      res.render('club_details', { user: user })
    }).catch(err => {
      res.json(err)
    })
})

router.route('/club/create').post( upload.single('logo'), (req, res) => { // this is for creating the club-head
  const club_name = req.body.club_name
  let logo
  if (req.file == undefined) {
    logo = ' '
  } else {
    logo = `${req.file.filename}`
  }
  var u_club_name = club_name.toUpperCase()
  var l_club_name = club_name.toLowerCase()
  var user = new usermodel({
    user_id: l_club_name,
    pswd: l_club_name,
    name: '',
    contact: '',
    email_id: '',
    dp_url: '',
    club_head: true,
    club_name: u_club_name,
    bio: ''
  })
  user.save((err, user) => {
    var club = new clubmodel({
      name: u_club_name,
      head: user._id,
      description: req.body.club_description,
      logo_url: logo
    })
    club.save((err) => {
      console.error.bind(console, 'Creating new user failed')
    })
    res.redirect('/admin/clubs/retrieve')
  })
})

// route to update the club details
router.route('/club/update/:id').post( upload.single('logo') ,(req, res) => {
  
  const id = req.params.id
  let club_name=req.body.name;
  if (req.file == undefined) {
    var change = {
      name: club_name,
      description: req.body.description,
    }
  } else {
    var change = {
      name: club_name,
      description: req.body.description,
      logo_url: req.file.filename
    }
  }

  var u_club_name = club_name.toUpperCase()
  var l_club_name = club_name.toLowerCase()
  var changeU={
    user_id: l_club_name,
    pswd: l_club_name,
    club_name: u_club_name
  }
  clubmodel.findByIdAndUpdate(id, change,
    function(err, result) {
      if (err) {
        res.status(400).send(err)
      } else {
        usermodel.findByIdAndUpdate({ _id: result.head },changeU)
        .then(admin => {
          res.redirect("/admin/clubs/retrieve")
        }).catch(err => {
          res.status(404).send(err)
        })          
      }
    }
    );
})
module.exports = router
