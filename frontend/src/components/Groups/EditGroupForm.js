import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchGroupById } from "../../store/group";
import { useEffect } from "react";
import GroupForm from "./GroupForm";

const EditGroupForm = () => {
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const group = useSelector((state) => state.groups.currGroup); 

    useEffect(() => {
        dispatch(fetchGroupById(groupId));
    }, [dispatch, groupId]);

    if (!group) return <></>;

    return (
        Object.keys(group).length > 1 && (
            <>
                <GroupForm group={group} formType="Update Group" />
            </>
        )
    );
};

export default EditGroupForm;
