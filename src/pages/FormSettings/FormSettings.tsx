import React from "react";
import "./FormSettings.scss";
import { Formik } from "formik";
import * as yup from "yup";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "../../components/InputGroup/InputGroup";

interface FormValues {
  sets: number;
  pointsPerSet: number;
  pointsLastSet: number;
}

const FormSettings: React.FC = () => {
  const initialValues: FormValues = {
    sets: 7,
    pointsPerSet: 25,
    pointsLastSet: 15,
  };

  return (
    <div className="FormSettings" data-testid="form-settings">
      <Formik
        initialValues={initialValues}
        validationSchema={yup.object({
          sets: yup.number().min(1).max(7).required("Required"),
          pointsPerSet: yup.number().min(5).max(30).required("Required"),
          pointsLastSet: yup.number().min(5).max(20).required("Required"),
        })}
        onSubmit={(values, actions) => {
          console.log({ values, actions });
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }}
      >
        {({ values, errors, touched, handleSubmit, handleChange }) => {
          return (
            <div className="form-container">
              <Container className="my-auto">
                <h1>Game Settings</h1>

                <Form onSubmit={handleSubmit}>
                  <Form.Row>
                    <InputGroup
                      label="Sets"
                      type="number"
                      name="sets"
                      value={values.sets}
                      onChange={handleChange}
                      isInvalid={!!(touched.sets && !!errors.sets)}
                      ariaInvalid={!!errors.sets}
                      error={errors.sets}
                    />

                    <InputGroup
                      label="Points per set"
                      type="number"
                      name="pointsPerSet"
                      value={values.pointsPerSet}
                      onChange={handleChange}
                      isInvalid={touched.pointsPerSet && !!errors.pointsPerSet}
                      ariaInvalid={!!errors.pointsPerSet}
                      error={errors.pointsPerSet}
                    />

                    <InputGroup
                      label="Points for last set"
                      type="number"
                      name="pointsLastSet"
                      value={values.pointsLastSet}
                      onChange={handleChange}
                      isInvalid={
                        touched.pointsLastSet && !!errors.pointsLastSet
                      }
                      ariaInvalid={!!errors.pointsLastSet}
                      error={errors.pointsLastSet}
                    />

                    <Form.Check
                      id="2pdiff"
                      type="checkbox"
                      className="md-3"
                      label="2 points difference"
                    ></Form.Check>
                  </Form.Row>

                  <Form.Row></Form.Row>

                  <Button className="form-submit primary" type="submit">
                    Submit
                  </Button>
                </Form>
              </Container>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};

export default FormSettings;
