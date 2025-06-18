class PictureController {

    readPicture = async (req: any, res: any, next: any) => {
        try {
            console.log("in picture controller");
            
            return res.status(200).send(
                { picture: 'https://www.svgrepo.com/show/16729/success.svg' }
            );
        } catch (err) {
            next(err);
        }
    };
};

export default new PictureController();