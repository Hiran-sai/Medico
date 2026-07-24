import jwt from 'jsonwebtoken';

//doctor authentication middleware

const authDoctor = async(req, res, next) => {
    try{

        const {dtoken} = req.headers
        if(!dtoken){
            return res.json({
                success: false,
                message: "Not Authorized"
            })
        }
        const tokenDecode = jwt.verify(dtoken, process.env.JWT_SECRET)

        // avoid mutating undefined `req.body` (can be undefined for some requests)
        if (!req.body) req.body = {}
        // store doctor id on req for downstream handlers
        req.doctorId = tokenDecode.id
        req.body.doctorId = tokenDecode.id

        next()

    }catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export default authDoctor