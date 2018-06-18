const mongoose = require('mongoose'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    usrSchema = new mongoose.Schema({
        name: String, //name of the user
        pass: String,
        dispName:String,
        id: { type: String, default: uuid.v1() },
        salt: String,
        regDate:{type:Date, default:Date.now}
        currGames: [String], //list of String ids of games this user is currently playing
        doneGames: [String] //games this user finished
    }, { collection: 'User' });

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
const generateSalt = function() {
    return crypto.randomBytes(16).toString('base64');
};

const encryptPassword = function(plainText, salt) {
    console.log('PASSWORD', plainText, salt)
    const hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};
usrSchema.statics.generateSalt = generateSalt;
usrSchema.statics.encryptPassword = encryptPassword;
/*Note about methods, statics, and virtuals
A method exists on a single INSTANCE of a document in mongo. So the 'correct password' method 
below works on each specific user, not the user model as a whole!
A static is the opposite: it is called on the model as a whole.
Finally, a virtual describes a particular function effectively 'acts' like a property: it can be references as per normal mongo document properties (e.g., mongoose.model('MyModel').findOne({someVirtualProp:'potato'})). However, it doesn't actually EXIST in the schema, and the response that each document gives is generated on the spot by the virtuals fn. 
Another example: let's say you have a series of quests, each with a number of points. You could either update a 'totalpoints' field every time you save a new quest, or you could have a virtual that just grabs all of the points from every quest and spits out the sum.
*/
usrSchema.methods.correctPassword = function(candidatePassword) {
    console.log('this users condiments:', this.salt, 'and their pwd:', this.pass)
    return encryptPassword(candidatePassword, this.salt) === this.pass;
};
mongoose.model('User', usrSchema);