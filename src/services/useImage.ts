import useAuthFetch from "./useAuthFetch";

export default function useImgae() {
    const {authFetch} = useAuthFetch();

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cloud-image/upload-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Image upload failed');
        }

        const data = await response.json();
        return data.data; 
    }

    return {
        uploadImage,
    };
}