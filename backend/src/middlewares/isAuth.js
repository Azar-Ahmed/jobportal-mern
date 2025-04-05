import jwt from 'jsonwebtoken'

export const isAuthenticated = async (req, res, next) => {
    try {
       const token = req.cookies.token;
       if (!token)  return res.status(400).json({ success: false, message: 'User is not authorized!'})

      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      if (!decoded)  return res.status(400).json({ success: false, message: 'Invalid Token!'})
      req.id = decoded.userId;
        next();
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server Error"}) 
        
    }
}