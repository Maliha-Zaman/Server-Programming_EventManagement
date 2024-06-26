const User = require("../dataModels/User.model");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");

// const users = []; // store the user info here

// const initializePassport = require("../config/passport");
// initializePassport(
//   passport, 
//   email => users.find(user => user.email === email),
//   id => users.find(user => user.id === id)
//   );

const getLogin = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "login.html");
  res.sendFile(filePath);
};

const postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};


const getRegister = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "register.html");
  res.sendFile(filePath);
};

const postRegister = async (req, res, next) => {
 

  const {  email, password,  } = req.body;
const name= req.body.username

  console.log(name)
  console.log(email)
  console.log(password)


const errors=[]
if (!name || !email || !password ) {
  errors.push("All fields are required!");
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
    errors.push("Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.");
}



if (errors.length > 0) {
  res.status(400).json({ error: errors });
} else {
  //Create New User
  User.findOne({ email: email }).then((user) => {
    if (user) {
      errors.push("User already exists with this email!");
      res.status(400).json({ error: errors });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          errors.push(err);
          res.status(400).json({ error: errors });
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              errors.push(err);
              res.status(400).json({ error: errors });
            } else {
              const newUser = new User({
                name,
                email,
                password: hash,
              });
              newUser
                .save()
                .then(() => {
                  res.redirect("/login");
                })
                .catch(() => {
                  errors.push("Please try again");
                  res.status(400).json({ error: errors });
                });
            }
          });
        }
      });
    }
  });
}
};
const getProfileInfos = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword, hobby, profession  } = req.body;
    console.log(newPassword)
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)



    // Update the password if provided
    if (newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update the designation if provided
    if (hobby) {
      user.hobby = hobby;
    }


    if (profession) {
      user.profession = profession
    }

    await user.save();

    res.json({ message: 'User information updated successfully' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const profileID = req.params.id;
    const profileInfo = await User.findById(profileID);

    if (!profileInfo) {
      return res.status(404).json({ error: "Profile information not found" });
    }

    await profileInfo.deleteOne({ _id: profileID });

    res.json({ message: "Profile information deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const getMediaPage = async (req, res) => {
//   const filePath = path.join(__dirname, "..", "views", "mediaFiles.html");
//   res.sendFile(filePath);
// };

const postProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
const photo = req.file.filename
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)


    if (photo) {
      user.profile_image = photo
    }
    await user.save();

    res.json({ message: 'Profile image updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postMultipleImages = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const photo = req.files.map((file) => file.filename);

    const userId = req.user.id
    const user = await User.findById(userId);
   
    if (photo) {
      user.images = photo
    }
    await user.save();

    res.json({ message: 'Multiple images updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMultipleImages = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId);
    const images= user.images

    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getProfileImage = async(req,res)=>{
  try{
  const userId = req.user.id
    const user = await User.findById(userId);
    const image= user.profile_image
    res.json({ image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const postAudioFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
const audio = req.file.filename
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)


    if (audio) {
      user.audio = audio
    }
    await user.save();

    res.json({ message: 'Audio updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getLanding = (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "landing.html");
  res.sendFile(filePath);
};
const getLogout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error("Error while logging out:", err);
    }
    res.redirect("/landing"); 
  });
};

module.exports = {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  getProfileInfos,
  updateProfile,
  deleteProfile,
  postProfileImage,
  postMultipleImages,
  getMultipleImages,
  postAudioFile, 
  getLogout,
  getLanding,
  getProfileImage, 
};

