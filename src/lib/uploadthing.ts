import {generateReactHelpers} from "@uploadthing/react/hooks";

import { ourFileRouter, type OurFileRouter } from "@/app/api/uploadthing/core";

export const {uploadFiles} = generateReactHelpers<OurFileRouter>();