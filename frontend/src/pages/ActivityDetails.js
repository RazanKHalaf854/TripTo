import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AttractionDetail from './AttractionDetail'; 
import NormalActivityDetail from './NormalActivityDetail'; 

const ActivityDetail = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/activity/${id}`)
      .then(res => setActivity(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!activity) return <div className="loader">Loading adventure...</div>;


  if (activity.category?.toLowerCase() === 'attraction') {
    return <AttractionDetail activity={activity} />;
  }


  return <NormalActivityDetail activity={activity} />;
};

export default ActivityDetail;