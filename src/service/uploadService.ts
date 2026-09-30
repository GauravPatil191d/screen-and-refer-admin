import axiosClient from "@/utils/axiosClient";

export default class UploadService {
    static async UploadMedia(
        file: File,
    ): Promise<string> {
        const formData = new FormData();

        formData.append("media", file);

        const response =
            await axiosClient.post(
                "/upload/media",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                },
            );

        return response.data.data.url;
    }
}