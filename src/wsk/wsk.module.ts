import { Module } from "@nestjs/common";
import { WskGateway } from "./wsk.gateway";
import { WskService } from "./wsk.service";
import { AuthModule } from "../modules/auth/auth.module";

@Module({
    imports: [AuthModule],
    providers: [WskService, WskGateway],
    exports: [WskService]
})
export class WskModule {}