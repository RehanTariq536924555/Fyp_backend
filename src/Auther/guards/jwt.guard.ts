import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard(['jwt', 'buyer-jwt']) {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Check if it's an admin token (base64 encoded JSON)
        const decoded = JSON.parse(atob(token));
        if (decoded.role === 'admin' && decoded.id) {
          // For admin tokens, bypass passport authentication
          request.user = { id: decoded.id, email: decoded.email };
          return true;
        }
      } catch (e) {
        // Not an admin token, continue with passport authentication
      }
    }
    
    return super.canActivate(context);
  }
}
