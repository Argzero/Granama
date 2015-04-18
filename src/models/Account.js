var crypto = require('crypto');
var mongoose = require('mongoose');

var AccountModel;
var iterations = 10000;
var saltLength = 64;
var keyLength = 64;

var AccountSchema = new mongoose.Schema({
    
    // Username is a unique string used as the display
    // name for the player and to log in 
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[A-Za-z0-9_]{1,16}$/
    },
    
    // Data is the profile data of the player stored
    // as a serialized JSON string
    profile: {
        type: String,
        default: '{}'
    },
	
    // Salt is the encryption buffer used to 
    // encrypt the password
	salt: {
		type: Buffer,
		required: true
	},
    
    // Password is used in conjunction with
    // the username to log in
    password: {
        type: String,
        required: true
    },
    
    // A time stamp for when the account was created
    createdData: {
        type: Date,
        default: Date.now
    }
});

/**
 * Grabs the important data from the entry and returns
 * it as an object.
 */
AccountSchema.methods.toAPI = function() {
    return {
        username: this.username,
        profile: JSON.parse(this.profile)
    };
};

AccountSchema.methods.validatePassword = function(password, callback) {
	var pass = this.password;
	
	crypto.pbkdf2(password, this.salt, iterations, keyLength, function(err, hash) {
		if(hash.toString('hex') !== pass) {
			return callback(false);
		}
		return callback(true);
	});
};

AccountSchema.statics.findByUsername = function(name, callback) {

    var search = {
        username: name
    };

    return AccountModel.findOne(search, callback);
};

AccountSchema.statics.generateHash = function(password, callback) {
	var salt = crypto.randomBytes(saltLength);
	
	crypto.pbkdf2(password, salt, iterations, keyLength, function(err, hash){
		return callback(salt, hash.toString('hex'));
	});
};

AccountSchema.statics.authenticate = function(username, password, callback) {
	return AccountModel.findByUsername(username, function(err, doc) {

		if(err)
		{
			return callback(err);
		}

        if(!doc) {
            return callback();
        }

        doc.validatePassword(password, function(result) {
            if(result === true) {
                return callback(null, doc);
            }
            
            return callback();
        });
        
	});
};

AccountModel = mongoose.model('Account', AccountSchema);


module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;