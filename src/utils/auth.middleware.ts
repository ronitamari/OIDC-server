import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../src/config/configuration';

/* This middleware checks the `Authorization` header of incoming requests
 * for a valid Bearer token. If the token is present and valid, the decoded
 * user information is attached to `req.user`, and the request proceeds.
 * Otherwise, a 401 or 403 error response is returned.
 */
export const authenticateJWT = (req: any, res: any, next: any) => {
    console.log("in auth func");
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    
    const token = authHeader.split(' ')[1].slice(1);
    
    try { 
        console.log("the token is: " + token);
        const decoded = jwt.verify(token, jwtConfig.secret);
        console.log("decoded: " + decoded);
        req.user = decoded;
        console.log("req.user: " + req.user);
        next();
    } catch (err) {
      console.log("error: " + err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
