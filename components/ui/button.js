export const Input = (props) => <input {...props} className={`border p-2 rounded ${props.className || ''}`} />;
export const Button = ({ children, ...props }) => <button {...props} className='bg-blue-500 text-white p-2 rounded w-full'>{children}</button>;
export const Card = ({ children }) => <div className='border rounded shadow p-4'>{children}</div>;
export const CardContent = ({ children }) => <div>{children}</div>;
