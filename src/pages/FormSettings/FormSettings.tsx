import React from 'react';
import './FormSettings.scss';
import { Formik, FieldAttributes } from 'formik';
import * as yup from 'yup';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

interface FormValues {
  sets: number;
  pointsPerSet: number;
  pointsLastSet: number;
}

// type NumberInputProps = { label: string } & FieldAttributes<{}>;

// TODO: move to own component
// const NumberInput: React.FC<NumberInputProps> = ({ label, ...props }) => {
//   const [field, meta] = useField(props);
//   return <
// }

const FormSettings: React.FC = () => {
  const initialValues: FormValues = { sets: 7, pointsPerSet: 25, pointsLastSet: 15 }

  return(
    <div className="FormSettings" data-testid="form-settings">

      <Formik
        initialValues={initialValues}

        validationSchema={yup.object({
          sets: yup.number().min(1).max(7).required('Required'),
          pointsPerSet: yup.number().min(5).max(30).required('Required'),
          pointsLastSet: yup.number().min(5).max(20).required('Required')
        })}

        onSubmit={(values, actions) => {
          console.log({values, actions})
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }}
      >
        {({
          values, 
          errors, 
          touched,
          handleSubmit,
          handleChange,
          handleBlur
        }) => (
          <Container id="cont">
            <h1>Game Settings</h1>

            <Form onSubmit={handleSubmit}>
              <Form.Row>
                <Form.Group as={Col} md="4" controlId="validationSets">
                  <Form.Label>Sets</Form.Label>
                  <Form.Control 
                    type="number"
                    name="sets"
                    value={values.sets}
                    onChange={handleChange}
                    isInvalid={touched.sets && !!errors.sets}
                    aria-invalid={!!errors.sets}
                    data-testid="sets"
                  />
                  <Form.Control.Feedback data-testid="sets-error">
                    {errors.sets}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="4" controlId="validationPointsSets">
                  <Form.Label>Points per set</Form.Label>
                  <Form.Control 
                    type="number"
                    name="pointsPerSet"
                    value={values.pointsPerSet}
                    onChange={handleChange}
                    isInvalid={touched.pointsPerSet && !!errors.pointsPerSet}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.pointsPerSet}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} md="4" controlId="validationLastSet">
                  <Form.Label>Points for last set</Form.Label>
                  <Form.Control 
                    type="number"
                    name="pointsLastSet"
                    value={values.pointsLastSet}
                    onChange={handleChange}
                    isInvalid={touched.pointsLastSet && !!errors.pointsLastSet}
                  />
                  <Form.Control.Feedback type="invalid">{errors.pointsLastSet}</Form.Control.Feedback>
                </Form.Group>
              </Form.Row>
                
              <Form.Row>

              </Form.Row>

              <Button className="form-submit primary" type="submit">Submit</Button>
            </Form>
          </Container>

        )}
      </Formik>

    </div>
  )
};

export default FormSettings;
