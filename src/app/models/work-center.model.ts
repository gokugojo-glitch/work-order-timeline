/*
*
* Defines the shape of a work center. Each has an ID and a name.
*/

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}
