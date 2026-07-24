import jwt from 'jsonwebtoken';

//user authentication middleware

const authUser = async(req, res, next) => {
    try{

        const {token} = req.headers
        if(!token){
            return res.json({
                success: false,
                message: "Not Authorized"
            })
        }
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        // avoid mutating undefined `req.body` (can be undefined for some requests)
        if (!req.body) req.body = {}
        // store user id on req for downstream handlers
        req.userId = tokenDecode.id
        req.body.userId = tokenDecode.id

        next()

    }catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export default authUser