import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

// Global so feature modules can inject CloudinaryService without each one
// re-declaring it as a provider (XaminityIQ's version of this module re-declared
// the service in every feature module that needed it — this is the cleaner version).
@Global()
@Module({
    providers: [CloudinaryService],
    exports: [CloudinaryService],
})
export class CloudinaryModule { }
