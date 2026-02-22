import { Job } from "../models/job.model.js";
//admin
export const postjob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            })
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(','),
            salary: Number(salary),
            location,
            jobType,
            experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(200).json({
            message: "New job created successfully",
            job,
            success: true,
        })
    } catch (error) {
        console.log(error);
    }
}
//student
export const getAllJobs = async (req, res) => {
    try {
        // ?keyword="frontend developer"
        const keyword = req.query.keyword || "";
        const query = {
            // Return documents that match any one of the conditions.
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                // $regex: This performs a pattern search (like contains).
                // options: "i" -> case sensitive
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        });
        if (!jobs) {
            return res.status(400).json({
                message: "Jobs not found",
                success: false
            })

        }
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//student
export const getJobById = async(req,res)=>{
    try{
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(400).json({
                message: "Job not found",
                success: false,
            });
        }
        return res.status(200).json({
            job,
            success: true
        })
    }catch(error){
        console.log(error);
    }
}

//admin :-how manu jobs did admin created
export const getAdminJobs = async(req,res)=>{
    try{
        const adminId=req.id;
        const jobs=await Job.find({created_by: adminId});
        if(!jobs){
            return res.status(400).json({
                message: "Job not found",
                success: false
            });
        }
        return res.status(200).json({
            jobs,
            success: true
        })
    }catch(error){
        console.log(error);
    }
}